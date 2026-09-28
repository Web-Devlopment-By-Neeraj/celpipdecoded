#!/usr/bin/env bash
# Require a pull request and the CI "check" job before merging to main.
# Run once from a GitHub account that can administer this repository.
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install it and run gh auth login." >&2
  exit 1
fi

repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"

gh api --method PUT "repos/${repo}/branches/main/protection" \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["check"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

echo "Branch protection updated for ${repo} main."
echo "Merges need the check status. Direct pushes are rejected."
