export function faqJsonLd(entries: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export function withinMetaLimits(title: string, description: string): boolean {
  return title.length <= 60 && description.length <= 160 && title.length > 0 && description.length > 0;
}

export const PUBLIC_PATHS = [
  "/",
  "/express-entry-draws",
  "/tools/diagnostic",
  "/tools/crs",
  "/plans",
  "/results",
  "/blog",
  "/resources",
  "/review",
  "/privacy",
  "/terms",
  "/refund",
] as const;
