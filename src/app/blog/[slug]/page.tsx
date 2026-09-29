import type { Metadata } from "next";
import { BlogArticle } from "../page";
import { SEED_POSTS } from "@/features/public-site/seed";

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = SEED_POSTS.find((item) => item.slug === slug);
    return {
      title: post?.metaTitle ?? "Blog",
      description: post?.metaDescription ?? "",
    };
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogArticle slug={slug} />;
}
