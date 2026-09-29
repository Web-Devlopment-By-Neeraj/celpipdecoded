import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { DiagnosticTool } from "@/components/site/DiagnosticTool";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Score diagnostic"),
  description: "Enter four scores and see which module is costing you the most points.",
};

export default function DiagnosticPage() {
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Which module is costing you points</h1>
        <p className="mt-3 text-base leading-7">Free. No account. The verdict uses the scores you entered.</p>
        <div className="mt-6">
          <DiagnosticTool />
        </div>
      </article>
    </PublicShell>
  );
}
