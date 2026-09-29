import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/require-admin";
import { validateDrawInput } from "@/features/public-site/draws";

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const input = {
    drawDate: String(form.get("drawDate") ?? ""),
    drawType: String(form.get("drawType") ?? ""),
    invitations: Number(form.get("invitations")),
    minCrs: Number(form.get("minCrs")),
  };
  const errors = validateDrawInput(input);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  return NextResponse.json({ ok: true, draw: input });
}
