import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnerMockTestPage } from "@/components/mock-tests/LearnerMockTestPage";

export const metadata: Metadata = {
  title: "Mock test - CELPIP Decoded",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PlaceholderMockTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ mockTestId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { mockTestId } = await params;

  // mock-test-1 and mock-test-2 have their own routes. Anything else is
  // either a published builder slug or a coming-soon slot from 3 to 5.
  if (
    mockTestId === "mock-test-1" ||
    mockTestId === "mock-test-2" ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(mockTestId)
  ) {
    notFound();
  }

  const match = /^mock-test-(\d+)$/.exec(mockTestId);
  const mockNumber = match ? Number(match[1]) : 0;
  const fallbackMockNumber =
    Number.isInteger(mockNumber) && mockNumber >= 3 && mockNumber <= 5
      ? mockNumber
      : null;
  const query = searchParams ? await searchParams : {};

  return (
    <LearnerMockTestPage
      slug={mockTestId}
      fallbackMockNumber={fallbackMockNumber}
      section={first(query.section)}
      flow={first(query.flow)}
    />
  );
}
