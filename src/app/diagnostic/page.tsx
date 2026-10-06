import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Practice diagnostic - CELPIP Decoded",
  description: "A short check that suggests what to practice next. It is a practice estimate, not an official result.",
};

export default async function DiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string }>;
}) {
  const { skill } = await searchParams;
  const suggestion =
    skill === "speaking"
      ? "Start with a timed speaking task and listen to the recording once before you submit it."
      : skill === "writing"
        ? "Write one email reply inside the word range, then read it aloud."
        : skill === "reading" || skill === "listening"
          ? "Do one short set and review the questions you missed before you start another."
          : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-semibold">What should you practice?</h1>
        <p className="mt-3 text-sm leading-6">
          This is a practice estimate for general information. It is not an official result and it does not predict an invitation.
        </p>
        <form method="get" action="/diagnostic" className="mt-6 space-y-3">
          <label className="block text-sm font-medium">
            Which skill feels hardest right now?
            <select name="skill" defaultValue={skill || "speaking"} className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2">
              <option value="speaking">Speaking</option>
              <option value="writing">Writing</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
            </select>
          </label>
          <button type="submit" className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
            Show a next step
          </button>
        </form>
        {suggestion ? <p className="mt-6 text-sm leading-6">{suggestion}</p> : null}
        <p className="mt-6 text-sm">
          <Link className="font-semibold underline" href="/signup">Save this and open the practice app</Link>
        </p>
      </div>
    </main>
  );
}
