import { HeaderChrome, type NavLabel } from "./HeaderChrome";
import { readSiteUser } from "@/features/public-site/session";

export const SITE_NAV: NavLabel[] = [
  { label: "Free tools", href: "/#free-tools" },
  { label: "Courses", href: "/#courses" },
  { label: "The app", href: "/#the-app" },
  { label: "Plans", href: "/#plans" },
  { label: "Results", href: "/#results" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

export async function SiteHeader() {
  const user = await readSiteUser();
  return <HeaderChrome user={user} labels={SITE_NAV} />;
}
