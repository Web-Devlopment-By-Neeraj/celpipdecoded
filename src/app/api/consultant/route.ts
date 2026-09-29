import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Consultant details require a stored consent." }, { status: 403 });
}
