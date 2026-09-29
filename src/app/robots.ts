import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/review", "/api"] },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://celpipdecoded.com"}/sitemap.xml`,
  };
}
