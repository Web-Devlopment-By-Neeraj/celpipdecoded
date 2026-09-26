import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { brandCopy, BRAND_NAME } from "@/features/brand/brand-copy";

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
    >
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        {children}
      </body>
    </html>
  );
}
