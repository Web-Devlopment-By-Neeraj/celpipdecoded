import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { brandCopy, BRAND_NAME } from "@/features/brand/brand-copy";
import { THEME_BOOT_SCRIPT, THEME_COLORS } from "@/features/theme/theme";
import { AuthEmailRedirect } from "@/components/auth/AuthEmailRedirect";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { AssistantBubble } from "@/components/platform/AssistantBubble";

// CELPIP Decoded typography (BRAND-01).
//
// The brand brief asks for one clean humanist sans, Inter or a system
// sans, so Inter carries headings and body copy alike. The serif slot in
// globals.css is mapped to the same family, which keeps every existing
// font-serif heading class working without a sweep through every screen.
const brandSans = Inter({
  variable: "--font-brand-sans",
  subsets: ["latin"],
  display: "swap",
});

// Mono is used only for identifiers in the admin builder.
const brandMono = JetBrains_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: brandCopy.rootTitle,
  description: brandCopy.metaDescription,
  applicationName: BRAND_NAME,
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: "default",
  },
};

// viewport-fit=cover lets the installed app draw under the phone's notch
// and home bar; the sticky headers and the bottom tab bars pad themselves
// with the safe-area insets instead.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME_COLORS.light,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${brandSans.variable} ${brandMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {children}
        <AuthEmailRedirect />
        <AssistantBubble />
        <PwaRegister />
      </body>
    </html>
  );
}
