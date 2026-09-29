import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { SEED_POSTS } from "@/features/public-site/seed";

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = SEED_POSTS.find((item) => item.slug === slug && item.kind === "resource");
  if (!post) notFound();
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">{post.title}</h1>
        <p className="mt-4 text-base leading-7">{post.body}</p>
      </article>
    </PublicShell>
  );
}
