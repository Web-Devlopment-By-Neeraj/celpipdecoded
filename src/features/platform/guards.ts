import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "./security";

export type AppUser = {
  id: string;
  email: string | null;
  emailConfirmed: boolean;
};

export async function requireAppUser(request: Request): Promise<
  | { ok: true; user: AppUser }
  | { ok: false; response: NextResponse }
> {
  if (!assertSameOrigin(request)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Cross-site request blocked." },
        { status: 403 },
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Sign in required." },
        { status: 401 },
      ),
    };
  }

  if (!user.email_confirmed_at) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Verify your email before continuing." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      emailConfirmed: true,
    },
  };
}
