// CRS points live in rows. The engine looks them up. It does not contain
// a point value. CELPIP level to CLB is also a row, and for CELPIP that
// conversion is 1:1.

export const CRS_SOURCE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html";

export const CRS_VERIFIED_ON = "2025-03-25";

export const IRCC_CALCULATOR_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html";

export const CRS_ESTIMATE_DISCLAIMER =
  "This is an estimate for general information, not immigration advice. Check the official IRCC tool.";

export type CrsPointRow = {
  factor: string;
  conditionKey: string;
  withSpouse: boolean;
  points: number;
  sourceUrl: string;
  verifiedOn: string;
};

export type CelpipLevel = "below_4" | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type EducationLevel =
  | "less_than_secondary"
  | "secondary"
  | "one_year"
  | "two_year"
  | "bachelors"
  | "two_or_more"
  | "masters"
  | "doctoral";

export type LanguageAbilities = {
  reading: CelpipLevel;
  writing: CelpipLevel;
  listening: CelpipLevel;
  speaking: CelpipLevel;
};

export type CrsProfile = {
  age: number;
  education: EducationLevel;
  firstLanguage: LanguageAbilities;
  secondLanguage: LanguageAbilities | null;
  canadianWorkYears: number;
  withSpouse: boolean;
  spouseEducation?: EducationLevel;
  spouseLanguage?: LanguageAbilities;
  spouseCanadianWorkYears?: number;
  foreignWorkYears: number;
  hasTradeCertificate: boolean;
  provincialNomination: boolean;
  canadianStudy: "none" | "one_two" | "three_plus";
  frenchNclc: number | null;
  siblingInCanada: boolean;
  jobOffer: "none" | "other" | "senior";
};

export type CrsLine = {
  factor: string;
  conditionKey: string;
  points: number;
};

export type CrsAreas = {
  core: number;
  spouse: number;
  transferability: number;
  additional: number;
};

export type CrsResult = {
  total: number;
  areas: CrsAreas;
  lines: CrsLine[];
  lastVerifiedOn: string;
};

export type CrsSettings = {
  jobOfferAwarded: boolean;
};

const ABILITIES = ["reading", "writing", "listening", "speaking"] as const;

function row(
  factor: string,
  conditionKey: string,
  withSpouse: boolean,
  points: number,
): CrsPointRow {
  return {
    factor,
    conditionKey,
    withSpouse,
    points,
    sourceUrl: CRS_SOURCE_URL,
    verifiedOn: CRS_VERIFIED_ON,
  };
}

function pair(
  factor: string,
  conditionKey: string,
  withoutSpouse: number,
  withSpouse: number,
): CrsPointRow[] {
  return [
    row(factor, conditionKey, false, withoutSpouse),
    row(factor, conditionKey, true, withSpouse),
  ];
}

const AGE: Array<[string, number, number]> = [
  ["17", 0, 0],
  ["18", 99, 90],
  ["19", 105, 95],
  ["20-29", 110, 100],
  ["30", 105, 95],
  ["31", 99, 90],
  ["32", 94, 85],
  ["33", 88, 80],
  ["34", 83, 75],
  ["35", 77, 70],
  ["36", 72, 65],
  ["37", 66, 60],
  ["38", 61, 55],
  ["39", 55, 50],
  ["40", 50, 45],
  ["41", 39, 35],
  ["42", 28, 25],
  ["43", 17, 15],
  ["44", 6, 5],
  ["45", 0, 0],
];

const EDUCATION: Array<[string, number, number]> = [
  ["less_than_secondary", 0, 0],
  ["secondary", 30, 28],
  ["one_year", 90, 84],
  ["two_year", 98, 91],
  ["bachelors", 120, 112],
  ["two_or_more", 128, 119],
  ["masters", 135, 126],
  ["doctoral", 150, 140],
];

const FIRST_LANGUAGE: Array<[string, number, number]> = [
  ["below_4", 0, 0],
  ["4", 0, 0],
  ["5", 6, 6],
  ["6", 9, 8],
  ["7", 17, 16],
  ["8", 23, 22],
  ["9", 31, 29],
  ["10", 34, 32],
  ["11", 34, 32],
  ["12", 34, 32],
];

const SECOND_LANGUAGE: Array<[string, number]> = [
  ["below_4", 0],
  ["4", 0],
  ["5", 1],
  ["6", 1],
  ["7", 3],
  ["8", 3],
  ["9", 6],
  ["10", 6],
  ["11", 6],
  ["12", 6],
];

const SPOUSE_LANGUAGE: Array<[string, number]> = [
  ["below_4", 0],
  ["4", 0],
  ["5", 1],
  ["6", 1],
  ["7", 3],
  ["8", 3],
  ["9", 5],
  ["10", 5],
  ["11", 5],
  ["12", 5],
];

const WORK: Array<[string, number, number]> = [
  ["0", 0, 0],
  ["1", 40, 35],
  ["2", 53, 46],
  ["3", 64, 56],
  ["4", 72, 63],
  ["5", 80, 70],
];

const SPOUSE_EDUCATION: Array<[string, number]> = [
  ["less_than_secondary", 0],
  ["secondary", 2],
  ["one_year", 6],
  ["two_year", 7],
  ["bachelors", 8],
  ["two_or_more", 9],
  ["masters", 10],
  ["doctoral", 10],
];

const SPOUSE_WORK: Array<[string, number]> = [
  ["0", 0],
  ["1", 5],
  ["2", 7],
  ["3", 8],
  ["4", 9],
  ["5", 10],
];

export function seedCrsPoints(): CrsPointRow[] {
  const rows: CrsPointRow[] = [];
  for (const [key, single, spouse] of AGE) rows.push(...pair("age", key, single, spouse));
  for (const [key, single, spouse] of EDUCATION) {
    rows.push(...pair("education", key, single, spouse));
  }
  for (const [key, single, spouse] of FIRST_LANGUAGE) {
    rows.push(...pair("first_language", key, single, spouse));
  }
  for (const [key, points] of SECOND_LANGUAGE) {
    rows.push(row("second_language", key, false, points));
    rows.push(row("second_language", key, true, points));
  }
  for (const [key, points] of SPOUSE_LANGUAGE) {
    rows.push(row("spouse_language", key, true, points));
  }
  for (const [key, single, spouse] of WORK) {
    rows.push(...pair("canadian_work", key, single, spouse));
  }
  for (const [key, points] of SPOUSE_EDUCATION) {
    rows.push(row("spouse_education", key, true, points));
  }
  for (const [key, points] of SPOUSE_WORK) {
    rows.push(row("spouse_work", key, true, points));
  }

  const transfer: Array<[string, string, number]> = [
    ["transfer:education_language", "clb7_one_year", 13],
    ["transfer:education_language", "clb7_two_plus", 25],
    ["transfer:education_language", "clb9_one_year", 25],
    ["transfer:education_language", "clb9_two_plus", 50],
    ["transfer:education_work", "ca1_one_year", 13],
    ["transfer:education_work", "ca1_two_plus", 25],
    ["transfer:education_work", "ca2_one_year", 25],
    ["transfer:education_work", "ca2_two_plus", 50],
    ["transfer:foreign_language", "fw1_clb7", 13],
    ["transfer:foreign_language", "fw3_clb7", 25],
    ["transfer:foreign_language", "fw1_clb9", 25],
    ["transfer:foreign_language", "fw3_clb9", 50],
    ["transfer:foreign_canadian", "fw1_ca1", 13],
    ["transfer:foreign_canadian", "fw3_ca1", 25],
    ["transfer:foreign_canadian", "fw1_ca2", 25],
    ["transfer:foreign_canadian", "fw3_ca2", 50],
    ["transfer:certificate", "clb5", 25],
    ["transfer:certificate", "clb7", 50],
  ];
  for (const [factor, key, points] of transfer) {
    rows.push(row(factor, key, false, points));
    rows.push(row(factor, key, true, points));
  }

  rows.push(row("additional:nomination", "yes", false, 600));
  rows.push(row("additional:study", "one_two", false, 15));
  rows.push(row("additional:study", "three_plus", false, 30));
  rows.push(row("additional:french", "nclc7_en_low", false, 25));
  rows.push(row("additional:french", "nclc7_en_clb5", false, 50));
  rows.push(row("additional:sibling", "yes", false, 15));
  rows.push(row("additional:job_offer", "other", false, 50));
  rows.push(row("additional:job_offer", "senior", false, 200));

  rows.push(row("cap:core", "max", false, 500));
  rows.push(row("cap:core", "max", true, 460));
  rows.push(row("cap:spouse", "max", true, 40));
  rows.push(row("cap:second_language", "max", false, 24));
  rows.push(row("cap:second_language", "max", true, 22));
  rows.push(row("cap:transfer_education_language", "max", false, 50));
  rows.push(row("cap:transfer_education_work", "max", false, 50));
  rows.push(row("cap:transfer_foreign_language", "max", false, 50));
  rows.push(row("cap:transfer_foreign_canadian", "max", false, 50));
  rows.push(row("cap:transfer_certificate", "max", false, 50));
  rows.push(row("cap:transferability", "max", false, 100));
  rows.push(row("cap:additional", "max", false, 600));

  for (const level of ["below_4", "4", "5", "6", "7", "8", "9", "10", "11", "12"]) {
    const clb = level === "below_4" ? 0 : Number(level);
    rows.push(row("celpip_clb", level, false, clb));
  }

  return rows;
}

export function oldestVerifiedOn(table: CrsPointRow[]): string {
  return table.reduce(
    (oldest, item) => (item.verifiedOn < oldest ? item.verifiedOn : oldest),
    table[0]?.verifiedOn ?? CRS_VERIFIED_ON,
  );
}

function lookup(
  table: CrsPointRow[],
  factor: string,
  conditionKey: string,
  withSpouse: boolean,
): number {
  const exact = table.find(
    (item) =>
      item.factor === factor &&
      item.conditionKey === conditionKey &&
      item.withSpouse === withSpouse,
  );
  if (exact) return exact.points;
  const fallback = table.find(
    (item) => item.factor === factor && item.conditionKey === conditionKey,
  );
  if (!fallback) {
    throw new Error(`Missing CRS row ${factor}/${conditionKey}`);
  }
  return fallback.points;
}

function ageKey(age: number): string {
  if (age <= 17) return "17";
  if (age >= 20 && age <= 29) return "20-29";
  if (age >= 45) return "45";
  return String(age);
}

function workKey(years: number): string {
  if (years <= 0) return "0";
  if (years >= 5) return "5";
  return String(Math.floor(years));
}

export function celpipToClb(level: CelpipLevel, table: CrsPointRow[]): number {
  return lookup(table, "celpip_clb", String(level), false);
}

function minClb(abilities: LanguageAbilities, table: CrsPointRow[]): number {
  return Math.min(...ABILITIES.map((ability) => celpipToClb(abilities[ability], table)));
}

function educationBand(education: EducationLevel): "none" | "one_year" | "two_plus" {
  if (education === "less_than_secondary" || education === "secondary") return "none";
  if (education === "one_year") return "one_year";
  return "two_plus";
}

function cap(value: number, max: number): number {
  return Math.min(value, max);
}

export function calculate(
  profile: CrsProfile,
  table: CrsPointRow[],
  settings: CrsSettings,
): CrsResult {
  const spouse = profile.withSpouse;
  const lines: CrsLine[] = [];

  const push = (factor: string, conditionKey: string, points: number) => {
    lines.push({ factor, conditionKey, points });
    return points;
  };

  const agePoints = push(
    "age",
    ageKey(profile.age),
    lookup(table, "age", ageKey(profile.age), spouse),
  );
  const educationPoints = push(
    "education",
    profile.education,
    lookup(table, "education", profile.education, spouse),
  );

  let firstLanguage = 0;
  for (const ability of ABILITIES) {
    const key = String(profile.firstLanguage[ability]);
    const points = lookup(table, "first_language", key, spouse);
    firstLanguage += push("first_language", `${ability}:${key}`, points);
  }

  let secondLanguage = 0;
  if (profile.secondLanguage) {
    for (const ability of ABILITIES) {
      const key = String(profile.secondLanguage[ability]);
      secondLanguage += push(
        "second_language",
        `${ability}:${key}`,
        lookup(table, "second_language", key, spouse),
      );
    }
    secondLanguage = cap(
      secondLanguage,
      lookup(table, "cap:second_language", "max", spouse),
    );
  }

  const workPoints = push(
    "canadian_work",
    workKey(profile.canadianWorkYears),
    lookup(table, "canadian_work", workKey(profile.canadianWorkYears), spouse),
  );

  const core = cap(
    agePoints + educationPoints + firstLanguage + secondLanguage + workPoints,
    lookup(table, "cap:core", "max", spouse),
  );

  let spouseTotal = 0;
  if (spouse) {
    const spouseEducation = profile.spouseEducation ?? "less_than_secondary";
    spouseTotal += push(
      "spouse_education",
      spouseEducation,
      lookup(table, "spouse_education", spouseEducation, true),
    );
    const spouseLanguage = profile.spouseLanguage ?? {
      reading: "below_4",
      writing: "below_4",
      listening: "below_4",
      speaking: "below_4",
    };
    for (const ability of ABILITIES) {
      const key = String(spouseLanguage[ability]);
      spouseTotal += push(
        "spouse_language",
        `${ability}:${key}`,
        lookup(table, "spouse_language", key, true),
      );
    }
    spouseTotal += push(
      "spouse_work",
      workKey(profile.spouseCanadianWorkYears ?? 0),
      lookup(table, "spouse_work", workKey(profile.spouseCanadianWorkYears ?? 0), true),
    );
    spouseTotal = cap(spouseTotal, lookup(table, "cap:spouse", "max", true));
  }

  const firstMin = minClb(profile.firstLanguage, table);
  const eduBand = educationBand(profile.education);
  const canadianYears = profile.canadianWorkYears;
  const foreignYears = profile.foreignWorkYears;

  const transferKeys = {
    "transfer:education_language": [] as string[],
    "transfer:education_work": [] as string[],
    "transfer:foreign_language": [] as string[],
    "transfer:foreign_canadian": [] as string[],
    "transfer:certificate": [] as string[],
  };

  if (eduBand !== "none" && firstMin >= 7) {
    transferKeys["transfer:education_language"].push(
      firstMin >= 9
        ? eduBand === "two_plus"
          ? "clb9_two_plus"
          : "clb9_one_year"
        : eduBand === "two_plus"
          ? "clb7_two_plus"
          : "clb7_one_year",
    );
  }
  if (eduBand !== "none" && canadianYears >= 1) {
    transferKeys["transfer:education_work"].push(
      canadianYears >= 2
        ? eduBand === "two_plus"
          ? "ca2_two_plus"
          : "ca2_one_year"
        : eduBand === "two_plus"
          ? "ca1_two_plus"
          : "ca1_one_year",
    );
  }
  if (foreignYears >= 1 && firstMin >= 7) {
    transferKeys["transfer:foreign_language"].push(
      foreignYears >= 3
        ? firstMin >= 9
          ? "fw3_clb9"
          : "fw3_clb7"
        : firstMin >= 9
          ? "fw1_clb9"
          : "fw1_clb7",
    );
  }
  if (foreignYears >= 1 && canadianYears >= 1) {
    transferKeys["transfer:foreign_canadian"].push(
      foreignYears >= 3
        ? canadianYears >= 2
          ? "fw3_ca2"
          : "fw3_ca1"
        : canadianYears >= 2
          ? "fw1_ca2"
          : "fw1_ca1",
    );
  }
  if (profile.hasTradeCertificate && firstMin >= 5) {
    transferKeys["transfer:certificate"].push(firstMin >= 7 ? "clb7" : "clb5");
  }

  const transferCaps: Record<string, string> = {
    "transfer:education_language": "cap:transfer_education_language",
    "transfer:education_work": "cap:transfer_education_work",
    "transfer:foreign_language": "cap:transfer_foreign_language",
    "transfer:foreign_canadian": "cap:transfer_foreign_canadian",
    "transfer:certificate": "cap:transfer_certificate",
  };

  let transferSum = 0;
  for (const factor of Object.keys(transferKeys) as Array<keyof typeof transferKeys>) {
    const keys = transferKeys[factor];
    const best = keys.reduce((max, key) => {
      const points = lookup(table, factor, key, spouse);
      return Math.max(max, points);
    }, 0);
    const capped = cap(best, lookup(table, transferCaps[factor], "max", false));
    if (keys[0]) push(factor, keys[0], capped);
    transferSum += capped;
  }
  const transferability = cap(
    transferSum,
    lookup(table, "cap:transferability", "max", false),
  );

  let additional = 0;
  if (profile.provincialNomination) {
    additional += push(
      "additional:nomination",
      "yes",
      lookup(table, "additional:nomination", "yes", false),
    );
  }
  if (profile.canadianStudy !== "none") {
    additional += push(
      "additional:study",
      profile.canadianStudy,
      lookup(table, "additional:study", profile.canadianStudy, false),
    );
  }
  if ((profile.frenchNclc ?? 0) >= 7) {
    const key = firstMin >= 5 ? "nclc7_en_clb5" : "nclc7_en_low";
    additional += push(
      "additional:french",
      key,
      lookup(table, "additional:french", key, false),
    );
  }
  if (profile.siblingInCanada) {
    additional += push(
      "additional:sibling",
      "yes",
      lookup(table, "additional:sibling", "yes", false),
    );
  }
  if (profile.jobOffer !== "none") {
    const offered = settings.jobOfferAwarded
      ? lookup(table, "additional:job_offer", profile.jobOffer, false)
      : 0;
    additional += push("additional:job_offer", profile.jobOffer, offered);
  }
  additional = cap(additional, lookup(table, "cap:additional", "max", false));

  return {
    total: core + spouseTotal + transferability + additional,
    areas: { core, spouse: spouseTotal, transferability, additional },
    lines,
    lastVerifiedOn: oldestVerifiedOn(table),
  };
}
