// Safe logging and safe wording for failed Supabase calls in the
// ADMIN-01 mock test builder.
//
// Two problems this file exists to solve, and they pull in opposite
// directions:
//
//   1. A staff member who hits a database error needs enough to report
//      it, and the server log needs enough to diagnose it. The PostgREST
//      code, details and hint are the useful part, and dropping them is
//      what turned the create failure into a silent one.
//
//   2. None of that can reach a production screen. A PostgREST error
//      names columns, constraints and sometimes the failing row, which
//      is not something to render to a browser.
//
// So the full error goes to the server log, and the screen gets a plain
// sentence. In development the screen also gets a short reason, because
// the person reading it is the person who can fix it.
//
// What is never logged here:
//   - SUPABASE_SERVICE_ROLE_KEY, or any environment variable
//   - ADMIN_EMAILS, or any admin email address
//   - the row being written, which can hold staff internal notes
//
// The only identifying context accepted is a slug or an id, because
// those are what a log reader needs to find the row again and neither is
// a secret.
//
// House style: normal hyphens only, straight quotes only.

// The shape of a PostgREST error, kept structural rather than importing
// PostgrestError, so a plain thrown object logs the same way.
export type SupabaseErrorLike = {
  message?: string | null;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
};

// Identifying context for the log line. Deliberately narrow: a slug or
// an id and nothing else. Do not widen this to accept a row.
export type AdminErrorContext = {
  slug?: string | null;
  id?: string | null;
};

// True when a short database reason may be shown on screen.
//
// NODE_ENV is set to "production" by next build, so this is false in a
// deployed app and true in next dev.
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

// Writes one structured line to the server log.
//
// action is the operation name, for example "createMockTest", so a log
// reader can tell which of nine admin operations failed without matching
// the message text.
export function logAdminSupabaseError(
  action: string,
  error: SupabaseErrorLike,
  context: AdminErrorContext = {},
): void {
  console.error("[admin/mock-tests] Supabase operation failed", {
    action,
    message: error.message ?? null,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    // Only ever a slug or an id. Undefined keys are dropped so a line
    // without context stays short.
    ...(context.slug ? { slug: context.slug } : {}),
    ...(context.id ? { id: context.id } : {}),
  });
}

// A one line reason for a development screen.
//
// The code is worth more than the message when there is one, since
// PGRST204 and 23502 name the class of problem exactly, so both go in
// when both exist. Returns an empty string in production.
export function developmentReason(error: SupabaseErrorLike): string {
  if (!isDevelopment()) {
    return "";
  }

  const code = error.code?.trim();
  const message = error.message?.trim();

  if (code && message) {
    return `${code}: ${message}`;
  }

  return code || message || "no reason reported";
}

// Joins a safe production sentence to the development reason.
//
// In production this returns safeMessage untouched, so the wording a
// staff member sees never depends on what the database said.
export function withDevelopmentReason(
  safeMessage: string,
  error: SupabaseErrorLike,
): string {
  const reason = developmentReason(error);

  return reason ? `${safeMessage} (development detail: ${reason})` : safeMessage;
}

// Logs, then builds the message a read path throws.
//
// Reads have no form to put a field error on, so they throw and the
// error boundary renders. The thrown message is the safe one.
export function reportAdminReadError(
  action: string,
  error: SupabaseErrorLike,
  safeMessage: string,
  context: AdminErrorContext = {},
): Error {
  logAdminSupabaseError(action, error, context);

  return new Error(withDevelopmentReason(safeMessage, error));
}
