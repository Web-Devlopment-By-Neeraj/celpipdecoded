import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { CrsForm } from "@/components/site/CrsForm";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("CRS calculator"),
  description: "Compare a CRS score you already have with recent Express Entry draws.",
};

export default function CrsPage() {
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">CRS calculator</h1>
        <p className="mt-3 text-base leading-7">
          Use the official Government of Canada tool if you need a new calculation. Then enter that score here to compare it with recent draws. This page does not predict an invitation.
        </p>
        <p className="mt-3 text-sm">
          <a className="underline" href="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html">
            Official CRS tool
          </a>
        </p>
        <CrsForm />
      </article>
    </PublicShell>
  );
}
