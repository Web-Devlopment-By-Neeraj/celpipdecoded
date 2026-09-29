import type { MetadataRoute } from "next";
import { PUBLIC_PATHS } from "@/features/public-site/seo";
import { SEED_POSTS } from "@/features/public-site/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://celpipdecoded.com";
  const staticPages = PUBLIC_PATHS.filter((path) => path !== "/review").map((path) => ({
    url: `${base}${path}`,
  }));
  const posts = SEED_POSTS.filter((post) => post.status === "published").map((post) => ({
    url: `${base}/${post.kind === "blog" ? "blog" : "resources"}/${post.slug}`,
  }));
  return [...staticPages, ...posts];
}
