import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";

// Protects every /dashboard route server side and wraps them in the shared
// app shell. Layouts do not re-render on client navigation, so each page
// under /dashboard also verifies the session close to its data.
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell userEmail={user.email ?? "Signed in"}>{children}</AppShell>
  );
}
