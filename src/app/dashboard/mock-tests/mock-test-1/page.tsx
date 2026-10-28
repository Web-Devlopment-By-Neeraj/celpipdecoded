import type { Metadata } from "next";
import { MockTest1Hub } from "@/components/mock-tests/MockTest1Hub";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Mock Test 1"),
  robots: { index: false, follow: false },
};

export default function MockTest1HubPage() {
  return <MockTest1Hub />;
}
