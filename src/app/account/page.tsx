import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account - CELPIP Decoded",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-semibold">Account</h1>
        <p className="mt-3 text-sm leading-6">Signed in as {user.email}.</p>
        <ul className="mt-6 space-y-3 text-sm">
          <li className="rounded-2xl bg-white p-4 ring-1 ring-ink/10">Email changes and password resets are sent by the auth provider.</li>
          <li className="rounded-2xl bg-white p-4 ring-1 ring-ink/10">Cancelling a subscription keeps access until the period ends.</li>
          <li className="rounded-2xl bg-white p-4 ring-1 ring-ink/10">
            <Link className="font-semibold underline" href="/legal/refunds">Refund rules</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
