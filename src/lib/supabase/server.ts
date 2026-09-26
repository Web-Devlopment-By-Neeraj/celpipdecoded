import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server Supabase client for server components, server actions, and route
// handlers. Uses the anon key plus the caller's auth cookies, so row level
// security still applies. For privileged access use admin.ts instead.
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a server component where cookies cannot be written.
          // Session refresh will be handled by middleware or a route handler.
        }
      },
    },
  });
}
