import {
  calculate,
  type CelpipLevel,
  type CrsPointRow,
  type CrsProfile,
  type CrsSettings,
  type EducationLevel,
  type LanguageAbilities,
} from "./crs";

const LADDER: CelpipLevel[] = [4, 5, 6, 7, 8, 9, 10, 11, 12];

const EDUCATION_LADDER: EducationLevel[] = [
  "less_than_secondary",
  "secondary",
  "one_year",
  "two_year",
  "bachelors",
  "two_or_more",
  "masters",
  "doctoral",
];

const ABILITIES = ["reading", "writing", "listening", "speaking"] as const;

export type BestChange = {
  kind: "language" | "education" | "canadian_work" | "second_language" | "spouse_language" | "french";
  gain: number;
  text: string;
};

function bump(level: CelpipLevel): CelpipLevel {
  if (level === "below_4") return 4;
  const index = LADDER.indexOf(level);
  if (index < 0 || index === LADDER.length - 1) return level;
  return LADDER[index + 1];
}

function setAll(abilities: LanguageAbilities, level: CelpipLevel): LanguageAbilities {
  return { reading: level, writing: level, listening: level, speaking: level };
}

function raiseAbility(
  abilities: LanguageAbilities,
  ability: (typeof ABILITIES)[number],
  level: CelpipLevel,
): LanguageAbilities {
  return { ...abilities, [ability]: level };
}

type Candidate = {
  kind: BestChange["kind"];
  text: (gain: number) => string;
  profile: CrsProfile;
};

export function bestSingleChange(
  profile: CrsProfile,
  table: CrsPointRow[],
  settings: CrsSettings,
): BestChange {
  const baseline = calculate(profile, table, settings).total;
  const candidates: Candidate[] = [];

  for (const ability of ABILITIES) {
    const next = bump(profile.firstLanguage[ability]);
    if (next !== profile.firstLanguage[ability]) {
      candidates.push({
        kind: "language",
        profile: {
          ...profile,
          firstLanguage: raiseAbility(profile.firstLanguage, ability, next),
        },
        text: (gain) =>
          `Your biggest gain is language: raising ${ability} by one level adds ${gain} points.`,
      });
    }
    for (const target of [9, 10] as const) {
      if (profile.firstLanguage[ability] === "below_4" || profile.firstLanguage[ability] < target) {
        candidates.push({
          kind: "language",
          profile: {
            ...profile,
            firstLanguage: raiseAbility(profile.firstLanguage, ability, target),
          },
          text: (gain) =>
            `Your biggest gain is language: reaching CLB ${target} in ${ability} adds ${gain} points.`,
        });
      }
    }
  }

  const allNext = {
    reading: bump(profile.firstLanguage.reading),
    writing: bump(profile.firstLanguage.writing),
    listening: bump(profile.firstLanguage.listening),
    speaking: bump(profile.firstLanguage.speaking),
  };
  candidates.push({
    kind: "language",
    profile: { ...profile, firstLanguage: allNext },
    text: (gain) =>
      `Your biggest gain is language: raising all four abilities by one level adds ${gain} points.`,
  });

  for (const target of [9, 10] as const) {
    candidates.push({
      kind: "language",
      profile: { ...profile, firstLanguage: setAll(profile.firstLanguage, target) },
      text: (gain) =>
        `Your biggest gain is language: reaching CLB ${target} in all four abilities adds ${gain} points.`,
    });
  }

  const educationIndex = EDUCATION_LADDER.indexOf(profile.education);
  if (educationIndex >= 0 && educationIndex < EDUCATION_LADDER.length - 1) {
    const nextEducation = EDUCATION_LADDER[educationIndex + 1];
    candidates.push({
      kind: "education",
      profile: { ...profile, education: nextEducation },
      text: (gain) => `Your biggest gain is education, which adds ${gain} points.`,
    });
  }

  if (profile.canadianWorkYears < 5) {
    candidates.push({
      kind: "canadian_work",
      profile: { ...profile, canadianWorkYears: profile.canadianWorkYears + 1 },
      text: (gain) => `Your biggest gain is one more year of Canadian work, which adds ${gain} points.`,
    });
  }

  if (!profile.secondLanguage) {
    candidates.push({
      kind: "second_language",
      profile: {
        ...profile,
        secondLanguage: setAll(profile.firstLanguage, 5),
      },
      text: (gain) =>
        `Your biggest gain is a second official language at CLB 5, which adds ${gain} points.`,
    });
  }

  if (profile.withSpouse && profile.spouseLanguage) {
    candidates.push({
      kind: "spouse_language",
      profile: {
        ...profile,
        spouseLanguage: {
          reading: bump(profile.spouseLanguage.reading),
          writing: bump(profile.spouseLanguage.writing),
          listening: bump(profile.spouseLanguage.listening),
          speaking: bump(profile.spouseLanguage.speaking),
        },
      },
      text: (gain) =>
        `Your biggest gain is your spouse's language, which adds ${gain} points.`,
    });
  }

  if ((profile.frenchNclc ?? 0) < 7) {
    candidates.push({
      kind: "french",
      profile: { ...profile, frenchNclc: 7 },
      text: (gain) => `Your biggest gain is French at NCLC 7, which adds ${gain} points.`,
    });
  }

  let winner: BestChange = {
    kind: "language",
    gain: 0,
    text: "No single change adds points on this profile.",
  };

  for (const candidate of candidates) {
    const total = calculate(candidate.profile, table, settings).total;
    const gain = total - baseline;
    if (gain <= 0) continue;
    const languageTie = gain === winner.gain && candidate.kind === "language" && winner.kind !== "language";
    if (gain > winner.gain || languageTie) {
      winner = { kind: candidate.kind, gain, text: candidate.text(gain) };
    }
  }

  return winner;
}
