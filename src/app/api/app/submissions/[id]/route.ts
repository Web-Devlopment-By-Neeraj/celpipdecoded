import { NextResponse } from "next/server";
import { requireAppUser } from "@/features/platform/guards";
import { ownsResource } from "@/features/platform/security";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

// Ownership is decided on the server. Until a submissions row is loaded
// from the database, every id is not found. A caller cannot pass another
// student's id and receive that student's answer.
export async function GET(request: Request, { params }: Params) {
  const auth = await requireAppUser(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const ownerId = id.split(":")[0] ?? "";
  if (!ownsResource(ownerId, auth.user.id)) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
}
