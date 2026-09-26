// The shape every admin server action returns.
//
// Kept out of actions.ts because a file marked "use server" may only
// export async functions. A type and a constant would be rejected at
// build time, so they live here and both sides import them.

export type AdminActionState = {
  status: "idle" | "success" | "error";
  // One sentence for the form to show. Empty while idle.
  message: string;
  // Field name to message, for the inputs that failed. Field names match
  // the input name attributes.
  fieldErrors: Record<string, string>;
};

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function adminActionError(
  message: string,
  fieldErrors: Record<string, string> = {},
): AdminActionState {
  return { status: "error", message, fieldErrors };
}

export function adminActionSuccess(message: string): AdminActionState {
  return { status: "success", message, fieldErrors: {} };
}
