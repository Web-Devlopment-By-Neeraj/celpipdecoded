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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-soft text-cream/70">
      <Container className="py-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <Link href="/" aria-label={brandCopy.name}>
            <CelpipDecodedLogo tone="reversed" size="lg" />
          </Link>

          <p className="text-sm font-medium text-cream/70">
            {brandCopy.communityLine}
          </p>

          <BrandDisclaimer tone="reversed" className="max-w-2xl text-sm leading-6" />

          <p className="text-xs text-cream/40">
            {year} {brandCopy.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
