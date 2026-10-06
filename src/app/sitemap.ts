import type { MetadataRoute } from "next";

const PATHS = ["", "/crs", "/draws", "/pricing", "/diagnostic", "/courses", "/ask", "/book", "/blog", "/legal/privacy", "/legal/terms", "/legal/refunds"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return PATHS.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
