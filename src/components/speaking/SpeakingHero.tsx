import Link from "next/link";
import { speakingCopy } from "@/features/speaking/task-copy";

// Header area for /dashboard/speaking: back link, module heading, subtext,
// and a small progress note about what is coming next.
export function SpeakingHero() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
      >
        <span aria-hidden>&larr;</span>
        {speakingCopy.backToDashboard}
      </Link>

      <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {speakingCopy.moduleTitle}
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70 sm:text-base">
        {speakingCopy.moduleSubtext}
      </p>

      <p className="mt-4 inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
        {speakingCopy.progressNote}
      </p>
    </section>
  );
}
