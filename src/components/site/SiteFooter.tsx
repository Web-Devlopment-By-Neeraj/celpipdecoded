import Link from "next/link";
import { BrandDisclaimer } from "@/components/brand/BrandDisclaimer";
import { CelpipDecodedLogo } from "@/components/brand/CelpipDecodedLogo";

const TOOL_LINKS = [
  { href: "/tools/crs", label: "CRS calculator" },
  { href: "/express-entry-draws", label: "Express Entry draws" },
  { href: "/tools/diagnostic", label: "Score diagnostic" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-cream text-ink">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3">
        <div>
          <CelpipDecodedLogo size="sm" />
          <p className="mt-3 text-sm leading-6">info@celpipdecoded.com</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Free tools</p>
          <ul className="mt-3 space-y-2 text-sm">
            {TOOL_LINKS.map((link) => (
              <li key={link.href}>
                <Link className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Policies</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="underline decoration-ink/30 underline-offset-4" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="underline decoration-ink/30 underline-offset-4" href="/terms">Terms of Service</Link></li>
            <li><Link className="underline decoration-ink/30 underline-offset-4" href="/refund">Refund Policy</Link></li>
            <li><Link className="underline decoration-ink/30 underline-offset-4" href="/blog">Blog</Link></li>
            <li><Link className="underline decoration-ink/30 underline-offset-4" href="/resources">Resources</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
          <BrandDisclaimer />
        </div>
      </div>
    </footer>
  );
}
