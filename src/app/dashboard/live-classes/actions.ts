"use server";

import { revalidatePath } from "next/cache";
import { holdPrivateSlot } from "@/features/booking/booking-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function holdPrivateSlotAction(
  startsAtIso: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const startsAt = new Date(startsAtIso);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: "That time is not valid." };
  }

  const result = await holdPrivateSlot(user.id, startsAt, user.email ?? null);
  if (!result.ok) return result;
  revalidatePath("/dashboard/live-classes");
  revalidatePath("/dashboard");
  return { ok: true };
}
