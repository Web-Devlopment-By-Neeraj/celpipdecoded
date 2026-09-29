"use client";

import { useState } from "react";
import {
  INSTAGRAM_CONSENT,
  WEBSITE_CONSENT,
  displayName,
  validateReview,
  type ReviewInput,
} from "@/features/public-site/review";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";

export function ReviewForm({
  requireEmail,
  initialName = "",
}: {
  requireEmail: boolean;
  initialName?: string;
}) {
  const [preview, setPreview] = useState(initialName);
  const [style, setStyle] = useState<ReviewInput["nameStyle"]>("first_initial");
  const [firstAttempt, setFirstAttempt] = useState(false);
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="mt-6 text-base">Thank you. Amar reads every review before anything goes on the site.</p>;
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const input: ReviewInput = {
          fullName: String(data.get("fullName") || ""),
          email: String(data.get("email") || "") || null,
          nameStyle: style,
          listening: numberOrNull(data.get("listening")),
          reading: numberOrNull(data.get("reading")),
          writing: numberOrNull(data.get("writing")),
          speaking: numberOrNull(data.get("speaking")),
          testDate: String(data.get("testDate") || ""),
          before: firstAttempt ? null : {
            listening: Number(data.get("beforeListening")),
            reading: Number(data.get("beforeReading")),
            writing: Number(data.get("beforeWriting")),
            speaking: Number(data.get("beforeSpeaking")),
          },
          firstAttempt,
          body,
          instagram: String(data.get("instagram") || ""),
          consentWebsite: data.get("website") === "on",
          consentInstagram: data.get("instagramConsent") === "on",
          trap: String(data.get("company") || ""),
          today: new Date().toISOString().slice(0, 10),
          minChars: DEFAULT_SETTINGS.reviewBodyMinChars,
          maxChars: DEFAULT_SETTINGS.reviewBodyMaxChars,
          requireEmail,
        };
        const next = validateReview(input);
        setErrors(next);
        if (next.length > 0) return;
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        if (response.ok) setDone(true);
      }}
    >
      <label className="block text-sm font-semibold">
        Full name
        <input name="fullName" defaultValue={initialName} onChange={(event) => setPreview(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
      </label>
      {requireEmail ? (
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
        </label>
      ) : null}
      <fieldset>
        <legend className="text-sm font-semibold">How should your name appear?</legend>
        {(["first", "first_initial", "full"] as const).map((option) => (
          <label key={option} className="mt-2 flex min-h-11 items-center gap-2 text-sm">
            <input type="radio" name="style" checked={style === option} onChange={() => setStyle(option)} />
            {option === "first" ? "First name" : option === "full" ? "Full name" : "First name and initial"}
          </label>
        ))}
        <p className="text-sm">Preview: {displayName(preview, style)}</p>
      </fieldset>
      <div className="grid grid-cols-4 gap-2">
        {["listening", "reading", "writing", "speaking"].map((field) => (
          <label key={field} className="text-sm font-semibold">
            <span className="sr-only">{field}</span>
            {field.slice(0, 1).toUpperCase()}
            <input name={field} inputMode="numeric" aria-label={field} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-2 text-base" />
          </label>
        ))}
      </div>
      <label className="block text-sm font-semibold">
        Test date
        <input name="testDate" type="date" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={firstAttempt} onChange={(event) => setFirstAttempt(event.target.checked)} />
        This was my first attempt
      </label>
      {firstAttempt ? null : (
        <div className="grid grid-cols-4 gap-2">
          {["beforeListening", "beforeReading", "beforeWriting", "beforeSpeaking"].map((field) => (
            <input key={field} name={field} inputMode="numeric" aria-label={field} className="min-h-11 rounded-xl border border-ink/15 px-2 text-base" />
          ))}
        </div>
      )}
      <label className="block text-sm font-semibold">
        What changed for you, and what would you tell someone just starting?
        <textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} className="mt-1 min-h-32 w-full rounded-xl border border-ink/15 p-3 text-base" />
      </label>
      <p className="text-sm">{body.trim().length} / {DEFAULT_SETTINGS.reviewBodyMaxChars}</p>
      <label className="block text-sm font-semibold">
        Score report, optional
        <input name="proof" type="file" accept="image/*,.pdf" className="mt-1 block w-full text-base" />
      </label>
      <p className="text-sm">Optional, but needed for the Verified badge.</p>
      <label className="block text-sm font-semibold">
        Instagram
        <input name="instagram" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
      </label>
      <label className="flex gap-2 text-sm"><input name="website" type="checkbox" /> {WEBSITE_CONSENT}</label>
      <label className="flex gap-2 text-sm"><input name="instagramConsent" type="checkbox" /> {INSTAGRAM_CONSENT}</label>
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {errors.map((error) => <p key={error.field} className="text-sm text-red-800">{error.message}</p>)}
      <button type="submit" className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white">Submit</button>
    </form>
  );
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  return Number(value);
}
