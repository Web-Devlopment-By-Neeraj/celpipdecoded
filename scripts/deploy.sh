#!/usr/bin/env bash
# Deploy CELPIP Decoded to Vercel and apply Supabase migrations.
# Production runs only from main. Preview does not migrate unless --migrate is set.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TARGET="preview"
SYNC_ENV=0
SKIP_CHECKS=0
SKIP_GIT_GUARD=0
MIGRATE_ONLY=0
SKIP_MIGRATE=0
FORCE_MIGRATE=0

usage() {
  cat <<'EOF'
Usage: scripts/deploy.sh [preview|production] [options]

Targets:
  preview      Vercel preview deployment. Does not migrate unless --migrate is set.
  production   Supabase migrations, then Vercel production. Requires main.

Options:
  --sync-env       Push non-empty .env.local values to the selected Vercel environment.
  --migrate        Apply migrations for a preview deploy as well.
  --skip-migrate   Deploy the app without applying migrations.
  --migrate-only   Apply migrations and stop. Implies production.
  --skip-checks    Skip lint, typecheck, and tests. For CI after those jobs passed.
  --skip-git-guard Skip the main-branch check. Allowed only when GITHUB_ACTIONS=true.
  -h, --help       Show this help.

Environment:
  VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
  SUPABASE_DB_URL
    or SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, and SUPABASE_DB_PASSWORD
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    preview|production)
      TARGET="$1"
      ;;
    --sync-env)
      SYNC_ENV=1
      ;;
    --skip-checks)
      SKIP_CHECKS=1
      ;;
    --skip-git-guard)
      SKIP_GIT_GUARD=1
      ;;
    --migrate-only)
      MIGRATE_ONLY=1
      TARGET="production"
      ;;
    --skip-migrate)
      SKIP_MIGRATE=1
      ;;
    --migrate)
      FORCE_MIGRATE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [[ "$SKIP_MIGRATE" -eq 1 && "$FORCE_MIGRATE" -eq 1 ]]; then
  echo "Use either --skip-migrate or --migrate, not both." >&2
  exit 1
fi

if [[ "$SKIP_GIT_GUARD" -eq 1 && "${GITHUB_ACTIONS:-}" != "true" ]]; then
  echo "--skip-git-guard is only available in GitHub Actions." >&2
  exit 1
fi

need() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: $name" >&2
    exit 1
  fi
}

current_branch() {
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
  if [[ "$branch" == "HEAD" && "${GITHUB_REF:-}" == "refs/heads/main" ]]; then
    echo "main"
    return
  fi
  echo "$branch"
}

assert_production_git() {
  local branch
  branch="$(current_branch)"
  if [[ "$branch" != "main" ]]; then
    echo "Production deploys run from main after a pull request merge. Current branch: ${branch:-unknown}." >&2
    exit 1
  fi
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Working tree is not clean. Commit on a feature branch and merge through a pull request." >&2
    exit 1
  fi
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    return
  fi
  git fetch origin main
  if ! git merge-base --is-ancestor HEAD origin/main; then
    echo "HEAD is not on origin/main. Open a pull request instead of deploying a local main commit." >&2
    exit 1
  fi
}

run_checks() {
  npm run lint
  npm run typecheck
  npm test
}

supabase_bin() {
  if command -v supabase >/dev/null 2>&1; then
    echo "supabase"
    return
  fi
  echo "npx --yes supabase"
}

apply_migrations() {
  local bin
  bin="$(supabase_bin)"
  # shellcheck disable=SC2086
  if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
    $bin db push --db-url "$SUPABASE_DB_URL" --yes
    return
  fi
  need SUPABASE_ACCESS_TOKEN
  need SUPABASE_PROJECT_REF
  need SUPABASE_DB_PASSWORD
  export SUPABASE_ACCESS_TOKEN SUPABASE_DB_PASSWORD
  $bin link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
  $bin db push --yes --password "$SUPABASE_DB_PASSWORD"
}

write_vercel_project() {
  if [[ -f .vercel/project.json ]]; then
    return
  fi
  need VERCEL_ORG_ID
  need VERCEL_PROJECT_ID
  mkdir -p .vercel
  cat > .vercel/project.json <<EOF
{"orgId":"${VERCEL_ORG_ID}","projectId":"${VERCEL_PROJECT_ID}"}
EOF
}

vercel_bin() {
  if command -v vercel >/dev/null 2>&1; then
    echo "vercel"
    return
  fi
  echo "npx --yes vercel"
}

vercel_call() {
  local bin
  bin="$(vercel_bin)"
  # shellcheck disable=SC2086
  if [[ -n "${VERCEL_TOKEN:-}" ]]; then
    $bin "$@" --token "$VERCEL_TOKEN"
  else
    $bin "$@"
  fi
}

sync_env() {
  local file=".env.local"
  local environment="preview"
  if [[ "$TARGET" == "production" ]]; then
    environment="production"
  fi
  if [[ ! -f "$file" ]]; then
    echo "No $file to sync." >&2
    exit 1
  fi
  local line name value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(printf '%s' "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [[ -z "$line" || "$line" != *"="* ]] && continue
    name="${line%%=*}"
    value="${line#*=}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    if [[ -z "$value" || "$value" == your-* ]]; then
      continue
    fi
    printf '%s' "$value" | vercel_call env add "$name" "$environment" --force --yes >/dev/null
    echo "Synced $name to Vercel $environment."
  done < "$file"
}

deploy_vercel() {
  local environment="preview"
  local build_flag=()
  local deploy_flag=()
  if [[ "$TARGET" == "production" ]]; then
    environment="production"
    build_flag=(--prod)
    deploy_flag=(--prod)
  fi
  write_vercel_project
  vercel_call pull --yes --environment="$environment"
  vercel_call build "${build_flag[@]}"
  vercel_call deploy --prebuilt "${deploy_flag[@]}" --yes
}

if [[ "$SKIP_GIT_GUARD" -eq 0 && ( "$TARGET" == "production" || "$MIGRATE_ONLY" -eq 1 ) ]]; then
  assert_production_git
fi

if [[ "$SKIP_CHECKS" -eq 0 ]]; then
  run_checks
fi

should_migrate=0
if [[ "$SKIP_MIGRATE" -eq 0 ]]; then
  if [[ "$TARGET" == "production" || "$FORCE_MIGRATE" -eq 1 || "$MIGRATE_ONLY" -eq 1 ]]; then
    should_migrate=1
  fi
fi

if [[ "$SYNC_ENV" -eq 1 ]]; then
  sync_env
fi

if [[ "$should_migrate" -eq 1 ]]; then
  echo "Applying Supabase migrations."
  apply_migrations
fi

if [[ "$MIGRATE_ONLY" -eq 1 ]]; then
  echo "Migrations applied."
  exit 0
fi

echo "Deploying to Vercel ($TARGET)."
deploy_vercel
echo "Deploy finished."
