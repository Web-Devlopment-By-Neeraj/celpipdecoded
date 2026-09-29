import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SiteUser = {
  id: string;
  email: string;
  name: string;
};

export async function readSiteUser(): Promise<SiteUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const metadata = data.user.user_metadata ?? {};
    const name =
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      data.user.email?.split("@")[0] ||
      "Account";
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      name,
    };
  } catch {
    return null;
  }
}
