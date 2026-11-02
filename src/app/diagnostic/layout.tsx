import type { ReactNode } from "react";
import { PublicPageFrame } from "@/components/landing/PublicPageFrame";

export default function Layout({ children }: { children: ReactNode }) {
  return <PublicPageFrame>{children}</PublicPageFrame>;
}
