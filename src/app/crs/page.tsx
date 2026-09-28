import type { Metadata } from "next";
import Link from "next/link";
import { bestSingleChange } from "@/features/platform/crs-best";
import {
  calculate,
  CRS_ESTIMATE_DISCLAIMER,
  IRCC_CALCULATOR_URL,
  seedCrsPoints,
  type CelpipLevel,
  type CrsProfile,
  type EducationLevel,
  type LanguageAbilities,
} from "@/features/platform/crs";
import { defaultSettings } from "@/features/platform/settings";

export const metadata: Metadata = {
  title: "CRS calculator - CELPIP Decoded",
  description:
    "Estimate a Comprehensive Ranking System total from age, education, language and work. This is general information, not immigration advice.",
};

export const dynamic = "force-dynamic";

const LEVELS: CelpipLevel[] = ["below_4", 4, 5, 6, 7, 8, 9, 10, 11, 12];
const EDUCATIONS: Array<[EducationLevel, string]> = [
  ["less_than_secondary", "Less than secondary"],
  ["secondary", "Secondary diploma"],
  ["one_year", "One-year post-secondary"],
  ["two_year", "Two-year post-secondary"],
  ["bachelors", "Bachelor's or a three-year program"],
  ["two_or_more", "Two or more credentials, one of them three years or longer"],
  ["masters", "Master's or a professional degree"],
  ["doctoral", "Doctoral degree"],
];

type Query = Record<string, string | string[] | undefined>;

function one(query: Query, key: string): string {
  const value = query[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function level(value: string): CelpipLevel {
  if (value === "below_4") return "below_4";
  const parsed = Number(value);
  if (LEVELS.includes(parsed as CelpipLevel)) return parsed as CelpipLevel;
  return 7;
}

function abilities(query: Query, prefix: string): LanguageAbilities {
  return {
    reading: level(one(query, `${prefix}r`) || "7"),
    writing: level(one(query, `${prefix}wr`) || "7"),
    listening: level(one(query, `${prefix}l`) || "7"),
    speaking: level(one(query, `${prefix}s`) || "7"),
  };
}

function profileFromQuery(query: Query): CrsProfile | null {
  if (!one(query, "age")) return null;
  const education = (one(query, "education") || "bachelors") as EducationLevel;
  const withSpouse = one(query, "spouse") === "yes";
  return {
    age: Number(one(query, "age")) || 29,
    education: EDUCATIONS.some(([key]) => key === education) ? education : "bachelors",
    firstLanguage: abilities(query, "f"),
    secondLanguage: one(query, "second") === "yes" ? abilities(query, "n") : null,
    canadianWorkYears: Number(one(query, "ca") || "0"),
    withSpouse,
    spouseEducation: withSpouse ? ((one(query, "se") || "secondary") as EducationLevel) : undefined,
    spouseLanguage: withSpouse ? abilities(query, "p") : undefined,
    spouseCanadianWorkYears: withSpouse ? Number(one(query, "sw") || "0") : undefined,
    foreignWorkYears: Number(one(query, "foreign") || "0"),
    hasTradeCertificate: one(query, "trade") === "yes",
    provincialNomination: one(query, "pnp") === "yes",
    canadianStudy: one(query, "study") === "three_plus" ? "three_plus" : one(query, "study") === "one_two" ? "one_two" : "none",
    frenchNclc: one(query, "french") ? Number(one(query, "french")) : null,
    siblingInCanada: one(query, "sibling") === "yes",
    jobOffer: one(query, "job") === "senior" ? "senior" : one(query, "job") === "other" ? "other" : "none",
  };
}

function LevelSelect({ name, label }: { name: string; label: string }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <select name={name} defaultValue="7" className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2">
        {LEVELS.map((item) => (
          <option key={String(item)} value={String(item)}>
            {item === "below_4" ? "Below 4" : `CELPIP ${item}`}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function CrsPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const profile = profileFromQuery(query);
  const table = seedCrsPoints();
  const settings = { jobOfferAwarded: defaultSettings()["crs.job_offer_awarded"] };
  const result = profile ? calculate(profile, table, settings) : null;
  const best = profile && result ? bestSingleChange(profile, table, settings) : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Free tool</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">CRS calculator</h1>
        <p className="mt-3 text-sm leading-6 text-ink/75">
          Work out an estimate from your own answers. No account is required. Language levels use CELPIP, and CELPIP maps one-to-one onto CLB.
        </p>

        <form method="get" action="/crs" className="mt-8 space-y-8">
          <fieldset className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <legend className="px-1 text-base font-semibold">Core</legend>
            <label className="block text-sm font-medium">
              Age in years
              <input name="age" type="number" min={17} max={60} required defaultValue={one(query, "age") || "29"} className="mt-1 block w-full rounded-xl border border-ink/15 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Education
              <select name="education" defaultValue={one(query, "education") || "bachelors"} className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2">
                {EDUCATIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LevelSelect name="fr" label="Reading" />
              <LevelSelect name="fwr" label="Writing" />
              <LevelSelect name="fl" label="Listening" />
              <LevelSelect name="fs" label="Speaking" />
            </div>
            <label className="block text-sm font-medium">
              Canadian work experience, in years
              <input name="ca" type="number" min={0} max={10} defaultValue={one(query, "ca") || "0"} className="mt-1 block w-full rounded-xl border border-ink/15 px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="second" value="yes" defaultChecked={one(query, "second") === "yes"} />
              I have a second official language
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LevelSelect name="nr" label="Second language reading" />
              <LevelSelect name="nwr" label="Second language writing" />
              <LevelSelect name="nl" label="Second language listening" />
              <LevelSelect name="ns" label="Second language speaking" />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <legend className="px-1 text-base font-semibold">Spouse or partner</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="spouse" value="yes" defaultChecked={one(query, "spouse") === "yes"} />
              Applying with a spouse or common-law partner
            </label>
            <p className="text-sm text-ink/70">Spouse fields are used only when that box is checked. Otherwise spouse points are zero.</p>
            <label className="block text-sm font-medium">
              Spouse education
              <select name="se" defaultValue="secondary" className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2">
                {EDUCATIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LevelSelect name="pr" label="Spouse reading" />
              <LevelSelect name="pwr" label="Spouse writing" />
              <LevelSelect name="pl" label="Spouse listening" />
              <LevelSelect name="ps" label="Spouse speaking" />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <legend className="px-1 text-base font-semibold">Additional</legend>
            <label className="block text-sm font-medium">
              Foreign work experience, in years
              <input name="foreign" type="number" min={0} max={20} defaultValue="0" className="mt-1 block w-full rounded-xl border border-ink/15 px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="trade" value="yes" />
              Certificate of qualification in a trade
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="sibling" value="yes" />
              Sibling in Canada who is a citizen or permanent resident
            </label>
            <label className="block text-sm font-medium">
              Canadian study
              <select name="study" defaultValue="none" className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2">
                <option value="none">None</option>
                <option value="one_two">One or two year credential</option>
                <option value="three_plus">Three years or longer</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              French NCLC, if you have a result
              <input name="french" type="number" min={0} max={12} className="mt-1 block w-full rounded-xl border border-ink/15 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium text-ink/60">
              Job offer
              <select name="job" defaultValue="none" className="mt-1 block w-full rounded-xl border border-ink/15 bg-ink/5 px-3 py-2">
                <option value="none">No job offer</option>
                <option value="other">Job offer, not currently awarded</option>
                <option value="senior">Senior job offer, not currently awarded</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pnp" value="yes" />
              Provincial nomination
            </label>
          </fieldset>

          <button type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white sm:w-auto">
            Calculate
          </button>
        </form>

        {result && best ? (
          <section className="mt-8 space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5" aria-live="polite">
            <h2 className="font-serif text-2xl font-semibold">Estimate: {result.total}</h2>
            <p className="text-sm leading-6">{CRS_ESTIMATE_DISCLAIMER}</p>
            <p className="text-sm">
              <a className="font-semibold text-brand underline" href={IRCC_CALCULATOR_URL}>Official IRCC CRS calculator</a>
            </p>
            <p className="text-sm text-ink/70">Points last verified {result.lastVerifiedOn}.</p>
            <ul className="grid grid-cols-2 gap-3 text-sm">
              <li className="rounded-2xl bg-cream px-3 py-3">Core {result.areas.core}</li>
              <li className="rounded-2xl bg-cream px-3 py-3">Spouse {result.areas.spouse}</li>
              <li className="rounded-2xl bg-cream px-3 py-3">Transferability {result.areas.transferability}</li>
              <li className="rounded-2xl bg-cream px-3 py-3">Additional {result.areas.additional}</li>
            </ul>
            <p className="text-sm leading-6">{best.text}</p>
            <p className="text-sm">
              <Link className="font-semibold text-brand underline" href={`/draws?total=${result.total}`}>Compare with recent draws</Link>
            </p>
            <p className="text-sm">
              <Link className="font-semibold text-brand underline" href={`/signup?next=${encodeURIComponent(`/crs?${new URLSearchParams(Object.entries(query).flatMap(([key, value]) => value ? [[key, Array.isArray(value) ? value[0] : value]] : [])).toString()}&save=1`)}`}>Save to my account</Link>
            </p>
          </section>
        ) : null}
      </div>
      {result ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-white px-4 py-3 sm:hidden">
          <p className="text-sm font-semibold">Estimate {result.total}</p>
          <p className="text-xs text-ink/70">Practice estimate for general information.</p>
        </div>
      ) : null}
    </main>
  );
}
