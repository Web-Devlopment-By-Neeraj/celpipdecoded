import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/PublicShell";
import { SEED_POSTS } from "@/features/public-site/seed";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Resources"),
  description: "Guides for using CELPIP Decoded practice.",
};

export default function ResourcesPage() {
  const posts = SEED_POSTS.filter((post) => post.kind === "resource" && post.status === "published");
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Resources</h1>
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.slug}><Link className="underline" href={`/resources/${post.slug}`}>{post.title}</Link></li>
          ))}
        </ul>
      </article>
    </PublicShell>
  );
}
