import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server only Supabase client that uses the service role key.
// This must never be imported into client components. The service role key
// bypasses row level security, so keep it on the server and out of NEXT_PUBLIC.
//
// The rule used to be a comment and nothing else. The guard below makes it
// enforced: if this module is ever pulled into a browser bundle the first call
// throws instead of quietly returning a client built from an undefined key.
// The check is on the call rather than at module scope so that bundling the
// module is not itself fatal, only using it in the wrong place is.
//
// Being server only is what makes the admin builder safe. Row level security
// on the mock test builder tables denies anon and authenticated outright, so
// this client is the only route to those tables, and every caller has to pass
// requireAdmin in src/lib/admin/require-admin.ts first. See the RLS note in
// supabase/migrations/013_mock_test_builder_admin_foundation.sql.
let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "getSupabaseAdmin is server only. Do not import src/lib/supabase/admin.ts from a client component.",
    );
  }

  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
