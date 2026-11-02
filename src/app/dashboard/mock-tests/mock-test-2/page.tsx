import type { Metadata } from "next";
import { LearnerMockTestPage } from "@/components/mock-tests/LearnerMockTestPage";

export const metadata: Metadata = {
  title: "Mock Test 2 - CELPIP Decoded",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MockTest2Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <LearnerMockTestPage
      slug="mock-test-2"
      fallbackMockNumber={2}
      section={first(params.section)}
      flow={first(params.flow)}
    />
  );
}
