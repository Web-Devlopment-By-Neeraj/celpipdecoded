// CELPIP Decoded brand copy (BRAND-01).
//
// One place for every brand string the product shows: the name, the
// public hero lines, the instructor line, the community name and the
// legal disclaimer. Screens import from here rather than typing the
// brand name again, so a wording change happens once.
//
// House style: normal hyphens only, no long hyphens or em dashes, and
// straight quotes only. CELPIP is always uppercase. Everything else is
// sentence case.
//
// Strings and pure helpers only, no side effects, so this file is safe
// to import from a client component.

export const BRAND_NAME = "CELPIP Decoded";

// The ownable word from the brief. Used where a single word reads better
// than the full lockup.
export const BRAND_WORD = "Decoded";

export const INSTRUCTOR_NAME = "Amar";

export const COMMUNITY_NAME = "The Codebreakers";

// The full legal line. Shown once per surface, in the footer.
export const BRAND_DISCLAIMER =
  "Not affiliated with, endorsed by, or acting on behalf of Paragon Testing Enterprises, Prometric, or CELPIP. CELPIP is a trademark of its owner. AI feedback is a practice estimate, not an official CELPIP result.";

// The short line used beside a score or an estimated level, where the
// full disclaimer would crowd the result.
export const PRACTICE_ESTIMATE_LINE =
  "Practice estimate, not an official CELPIP result.";

export const brandCopy = {
  name: BRAND_NAME,
  rootTitle: "CELPIP Decoded - CELPIP practice and strategy",
  metaDescription:
    "Practice CELPIP with real-format mock tests, AI-supported feedback, and instructor-led strategy.",

  // Public hero lines from the brief. Kept to the public surfaces: the
  // instructor "I" line is not repeated inside the signed in app.
  heroHeadline: "You're not bad at English.",
  heroSupport:
    "Most people do not struggle with CELPIP because of their English. They struggle because they do not know how CELPIP wants them to answer.",
  instructorLine:
    "I scored CLB 10+ on CELPIP, and now I teach the exact method I used.",
  instructorCredential: "CLB 10+ CELPIP instructor",
  instructorLabel: "Instructor: " + INSTRUCTOR_NAME,

  tagline: "CELPIP practice, decoded",
  communityName: COMMUNITY_NAME,
  communityLine:
    "Practise alongside " + COMMUNITY_NAME + ", the CELPIP Decoded community.",

  disclaimer: BRAND_DISCLAIMER,
  practiceEstimateLine: PRACTICE_ESTIMATE_LINE,
} as const;

// Page title helper, so every metadata title reads the same way:
// "Dashboard - CELPIP Decoded".
export function brandTitle(pageName: string): string {
  return pageName + " - " + BRAND_NAME;
}
