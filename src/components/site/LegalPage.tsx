import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { brandTitle } from "@/features/brand/brand-copy";

const PAGES = {
  privacy: {
    title: "Privacy Policy",
    body: "CELPIP Decoded stores the account, practice answers, and recordings you give us. You can download that data from account settings and ask for the account to be deleted. Payment records are kept only as long as tax law requires. Contact info@celpipdecoded.com.",
  },
  terms: {
    title: "Terms of Service",
    body: "CELPIP Decoded is independent practice. A level in the product is a practice estimate. We do not give immigration advice and we do not promise a result. Contact info@celpipdecoded.com.",
  },
  refund: {
    title: "Refund Policy",
    body: "Test Sprint can be cancelled from account settings in two clicks and stays available until the end of the paid period. A live batch seat can move to the next block more than 48 hours before the block starts. A private hour can be rescheduled with 24 hours notice. Contact info@celpipdecoded.com.",
  },
} as const;

export function legalMetadata(kind: keyof typeof PAGES): Metadata {
  return { title: brandTitle(PAGES[kind].title), description: PAGES[kind].body };
}

export function LegalPage({ kind }: { kind: keyof typeof PAGES }) {
  const page = PAGES[kind];
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">{page.title}</h1>
        <p className="mt-4 text-base leading-7">{page.body}</p>
      </article>
    </PublicShell>
  );
}
