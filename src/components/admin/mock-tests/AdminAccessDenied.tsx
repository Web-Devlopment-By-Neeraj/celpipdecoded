import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import type { AdminDenialReason } from "@/lib/admin/require-admin";

// What a non-admin sees at an admin URL.
//
// The screen is deliberately plain and says nothing about who is on the
// allow list or whether one exists in a useful way. The one distinction
// it does draw is between "you are not on the list" and "no list is
// configured on this deployment", because the second one is a setup
// mistake that otherwise looks identical to being refused, and whoever
// hits it is the person who has to fix it.
//
// No email address is printed. ADMIN_EMAILS is a server only variable
// and nothing in this component reads it.

export type AdminAccessDeniedProps = {
  reason: AdminDenialReason;
};

const COPY: Record<AdminDenialReason, { title: string; body: string }> = {
  not_signed_in: {
    title: "Sign in to continue",
    body: "This page is part of the staff mock test builder. Sign in with a staff account to open it.",
  },
  not_configured: {
    title: "Admin access is not configured",
    body: "No staff email list is set on this deployment, so nobody can open the builder. Set the ADMIN_EMAILS environment variable to a comma separated list of staff email addresses and restart the app. See docs/admin/admin-01-mock-test-builder-mvp.md for the exact steps.",
  },
  not_admin: {
    title: "Access denied",
    body: "This account is not on the staff list for the mock test builder. If that is wrong, ask an administrator to add your email address.",
  },
};

export function AdminAccessDenied({ reason }: AdminAccessDeniedProps) {
  const copy = COPY[reason];

  return (
    <div className="mx-auto w-full max-w-xl py-12">
      <AppCard variant="subtle">
        <p className={text.eyebrow}>Admin</p>
        <h1 className={cx(text.heading, "mt-2 text-2xl")}>{copy.title}</h1>
        <p className={cx("mt-3 text-sm leading-6", text.secondary)}>
          {copy.body}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <AppButtonLink href="/dashboard" variant="secondary" size="sm">
            Back to dashboard
          </AppButtonLink>
        </div>
      </AppCard>
    </div>
  );
}
