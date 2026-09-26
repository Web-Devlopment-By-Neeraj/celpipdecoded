import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server only admin gate for ADMIN-01.
//
// The project has no staff role in the database yet. profiles.role
// exists as a text column defaulting to 'student' and nothing reads it,
// so ADMIN-01 uses the smallest thing that is genuinely safe: a comma
// separated allow list in the ADMIN_EMAILS environment variable, read on
// the server and compared against the signed in Supabase user.
//
// Rules this file exists to keep:
//   - ADMIN_EMAILS has no NEXT_PUBLIC_ prefix, so it never reaches a
//     browser bundle. Do not import this module from a client component.
//   - No real email is hardcoded anywhere in the repo.
//   - A missing or empty ADMIN_EMAILS denies everybody instead of
//     throwing, so a deployment without the variable shows an access
//     denied screen rather than a crashed route.
//   - Every admin page and every admin server action calls this. A page
//     level check does not protect a server action, because a server
//     action is reachable by direct POST.
//
// When a database backed staff role lands, this helper is the single
// place that changes.

// Why a request was refused. The UI turns this into wording, so the
// reason stays a code rather than a sentence.
export type AdminDenialReason =
  | "not_signed_in"
  | "not_configured"
  | "not_admin";

export type AdminSession = {
  userId: string;
  email: string;
};

export type AdminSessionResult =
  | { ok: true; session: AdminSession }
  | { ok: false; reason: AdminDenialReason };

// Reads and normalizes the allow list. Returns an empty array when the
// variable is missing, empty, or only separators, which the callers
// treat as "nobody is an admin here".
function readAdminEmailAllowList(): string[] {
  const raw = process.env.ADMIN_EMAILS;

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

// True when the allow list has at least one entry. Used to tell a
// missing configuration apart from a signed in learner, so the access
// denied screen can say which one it is without printing the list.
export function isAdminAllowListConfigured(): boolean {
  return readAdminEmailAllowList().length > 0;
}

// Resolves the caller against the allow list. Never throws for an
// ordinary refusal, so a page can render an access denied screen.
export async function getAdminSession(): Promise<AdminSessionResult> {
  const supabase = await createSupabaseServerClient();

  // getUser validates the token with Supabase instead of trusting the
  // cookie, which matters here because this is an authorization check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not_signed_in" };
  }

  const allowList = readAdminEmailAllowList();

  if (allowList.length === 0) {
    return { ok: false, reason: "not_configured" };
  }

  const email = user.email?.trim().toLowerCase() ?? "";

  if (email.length === 0 || !allowList.includes(email)) {
    return { ok: false, reason: "not_admin" };
  }

  return { ok: true, session: { userId: user.id, email } };
}

// The gate for server actions, which have no screen to render.
//
// Returns null rather than throwing, so an action can answer with a
// plain refusal message instead of a stack trace. The reason code is
// deliberately dropped here: a direct POST from outside the UI learns
// only that it was refused, not whether an allow list exists or who is
// on it.
export async function requireAdmin(): Promise<AdminSession | null> {
  const result = await getAdminSession();

  return result.ok ? result.session : null;
}
