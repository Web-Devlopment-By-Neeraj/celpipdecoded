"use client";

import { usePathname } from "next/navigation";
import { MobileTabBar, type MobileTab } from "@/components/app/MobileTabBar";

// Bottom tab bar for the public site on phones (DESIGN.md, mobile
// navigation). Same component as the signed in bar, so the installed app
// feels like one product before and after sign in. The last tab follows
// the session: Dashboard when signed in, Sign in otherwise.

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicMobileTabBar({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname() ?? "";

  const links: Omit<MobileTab, "active">[] = [
    { key: "home", label: "Home", icon: "home", href: "/" },
    { key: "results", label: "Results", icon: "results", href: "/results" },
    { key: "crs", label: "CRS", icon: "calculator", href: "/crs" },
    { key: "pricing", label: "Pricing", icon: "pricing", href: "/pricing" },
    signedIn
      ? { key: "account", label: "Dashboard", icon: "dashboard", href: "/dashboard" }
      : { key: "account", label: "Sign in", icon: "account", href: "/login" },
  ];

  const tabs: MobileTab[] = links.map((link) => ({
    ...link,
    active: link.href ? isActive(pathname, link.href) : false,
  }));

  return <MobileTabBar tabs={tabs} label="Site" />;
}
