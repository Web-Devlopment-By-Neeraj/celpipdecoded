import Link from "next/link";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";
import { BrandDisclaimer } from "@/components/brand/BrandDisclaimer";
import { brandCopy } from "@/features/brand/brand-copy";
import { Container } from "./primitives";

// Public site footer (BRAND-01).
//
// It carries the brand lockup, the community name, and the one legal
// disclaimer. No official CELPIP logo and no third party mark appears
// here.

const columns = [
  {
    title: "Prepare",
    links: [
      { label: "Results", href: "/results" },
      { label: "AI practice", href: "/#ai-practice" },
      { label: "Course", href: "/courses" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "CRS calculator", href: "/crs" },
      { label: "Express Entry draws", href: "/draws" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Ask Amar", href: "/ask" },
      { label: "Book", href: "/book" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Refunds", href: "/legal/refunds" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-soft text-cream/70">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              aria-label={brandCopy.name}
              className="w-fit rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint"
            >
              <CelpipDecodedLogo tone="reversed" size="lg" showPromiseBelow />
            </Link>
            <p className="max-w-sm text-sm font-medium leading-6 text-cream/75">
              {brandCopy.communityLine}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/45">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-cream/75 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/10 pt-8">
          <BrandDisclaimer tone="reversed" className="max-w-3xl text-sm leading-6" />
          <p className="text-xs text-cream/40">
            {year} {brandCopy.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
