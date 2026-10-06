import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Practice notes - CELPIP Decoded",
  description: "Short original notes about practice. These pages are not official test instructions.",
};

const POSTS = [
  {
    slug: "practice-estimate",
    title: "What a practice estimate means",
    summary: "A level in this app is a practice estimate. It is not an official result.",
  },
  {
    slug: "how-a-sprint-works",
    title: "How a Test Sprint allowance works",
    summary: "Free practice has a small lifetime allowance. A sprint adds daily, weekly, and monthly caps.",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-semibold">Practice notes</h1>
        <ul className="mt-6 space-y-4">
          {POSTS.map((post) => (
            <li key={post.slug} className="rounded-3xl bg-white p-5 ring-1 ring-ink/10">
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm leading-6">{post.summary}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link className="underline" href="/">Back home</Link>
        </p>
      </div>
    </main>
  );
}
