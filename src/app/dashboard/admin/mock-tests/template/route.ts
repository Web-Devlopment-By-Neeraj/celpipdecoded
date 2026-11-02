import { NextResponse } from "next/server";
import { buildMockImportTemplate } from "@/features/mock-tests/mock-import-format";
import { getAdminSession } from "@/lib/admin/require-admin";

export async function GET() {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return new NextResponse("Sign in as staff to download this file.", {
      status: 401,
    });
  }

  return new NextResponse(buildMockImportTemplate(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="celpip-mock-test-template.csv"',
    },
  });
}
