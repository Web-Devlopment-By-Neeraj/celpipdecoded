import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_LANGUAGES } from "@/features/platform/video";

export const metadata: Metadata = {
  title: "Course videos - CELPIP Decoded",
  description: "Course lessons stay visible when they are locked. English and Hindi are the live languages.",
};

export default function CoursesPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold">Course</h1>
        <p className="mt-3 text-sm leading-6">
          Paid lessons stay on the page with a lock. A short preview plays for visitors. Full playback needs an active course purchase.
        </p>
        <ul className="mt-6 space-y-3">
          {DEFAULT_LANGUAGES.map((language) => (
            <li key={language.code} className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10">
              <span className="font-semibold">{language.name}</span>
              <span className="ml-2">{language.nativeName}</span>
              <span className="ml-2">{language.status === "live" ? "Available" : "Soon"}</span>
            </li>
          ))}
        </ul>
        <article className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-ink/10">
          <h2 className="text-lg font-semibold">Lesson 1 preview</h2>
          <p className="mt-2 text-sm leading-6">Locked. The first two minutes are the preview. The rest opens after you buy the course.</p>
          <Link href="/signup?next=/courses" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
            Unlock the full lesson
          </Link>
        </article>
      </div>
    </main>
  );
}
