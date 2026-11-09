import type { Metadata } from "next";
import { AppPageShell } from "@/components/app/AppPageShell";

export const metadata: Metadata = {
  title: "Mini-courses - CELPIP Decoded",
  description: "Short courses are not open yet.",
};

export default function MiniCoursesPage() {
  return (
    <AppPageShell
      eyebrow="Learn with Amar"
      title="Mini-courses"
      description="Coming soon. Short lessons will live here. This page may be removed if Amar decides mini-courses are not part of the product."
      width="narrow"
    >
      <p className="text-sm leading-6 text-ink/70">Nothing to start yet.</p>
    </AppPageShell>
  );
}
