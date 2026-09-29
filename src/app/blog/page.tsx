import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { SEED_POSTS } from "@/features/public-site/seed";
import { brandTitle } from "@/features/brand/brand-copy";

export const metadata: Metadata = {
  title: brandTitle("Blog"),
  description: "Notes on CELPIP practice from CELPIP Decoded.",
};

export default function BlogIndex() {
  const posts = SEED_POSTS.filter((post) => post.kind === "blog" && post.status === "published");
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Blog</h1>
        <ul className="mt-6 space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link className="text-lg font-semibold underline" href={`/blog/${post.slug}`}>{post.title}</Link>
              <p className="text-sm">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </article>
    </PublicShell>
  );
}

export function BlogArticle({ slug }: { slug: string }) {
  const post = SEED_POSTS.find((item) => item.slug === slug && item.status === "published");
  if (!post) notFound();
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">{post.title}</h1>
        <p className="mt-2 text-sm">{post.author}</p>
        <p className="mt-6 text-base leading-7">{post.body}</p>
      </article>
    </PublicShell>
  );
}
