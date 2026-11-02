import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LandingHeader } from "./LandingHeader";

// The public header for any page other than the home page, which already
// reads the session itself. Resolves whether a visitor is signed in so the
// header and the bottom tab bar can offer Dashboard instead of Sign in.

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingHeader signedIn={Boolean(user)} />;
}
