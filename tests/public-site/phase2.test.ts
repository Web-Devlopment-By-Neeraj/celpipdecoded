import { describe, expect, it } from "vitest";
import { countWords } from "@/features/writing/word-count";
import { diagnoseScores, validateDiagnosticScores } from "@/features/public-site/diagnostic";
import { compareScore, filterDraws, validateDrawInput } from "@/features/public-site/draws";
import { SEED_DRAWS } from "@/features/public-site/seed";
import { buildStudyPlanner } from "@/features/public-site/study-planner";
import {
  computeResultStats,
  filterTestimonials,
  publicTestimonials,
  scoreRingColor,
  scoreRingFill,
} from "@/features/public-site/results";
import { SEED_TESTIMONIALS } from "@/features/public-site/seed";
import { areaUnlocked } from "@/features/public-site/access";
import {
  allowanceReached,
  chooseNextStep,
  countdownLabel,
  formatFreeEvaluations,
} from "@/features/public-site/next-step";
import { isMisspelled } from "@/features/public-site/spellcheck";
import { buildStudyPlan, comparePair } from "@/features/public-site/study-plan";
import {
  defaultInstructionTexts,
  forbiddenPhraseCount,
  instructionForMode,
  missingInstructionKeys,
  renderInstruction,
} from "@/features/public-site/instructions";
import {
  buildMock,
  buildMockLibrary,
  markingSplit,
  validateMockStructure,
} from "@/features/public-site/mocks";
import { askRateLimited, looksLikePdf, validateQuestion } from "@/features/public-site/ask";
import {
  displayName,
  reviewIsSpamTrap,
  sniffProofMime,
  tokenExpired,
  validateReview,
} from "@/features/public-site/review";
import { canReschedule, formatZonedRange } from "@/features/public-site/booking";
import { audioTooLong, buildDemoFeedback, consumeRateLimit } from "@/features/public-site/demo";
import { coverageGaps, followLine, LANGUAGES, miniCourseLibrary, previewStopsAt, switchLanguages } from "@/features/public-site/courses";
import { SKILL_TAGS } from "@/features/public-site/courses";
import { buildEvaluationPdf, evaluationPdfFilename, pdfContains, PDF_FOOTER } from "@/features/public-site/pdf";
import { codeExpired, deletionConfirmed, exportLinkExpired } from "@/features/public-site/account";
import { faqJsonLd } from "@/features/public-site/seo";
import { FAQ_ENTRIES } from "@/features/public-site/seed";
import { signupStarted } from "@/features/public-site/analytics";
import { BRAND_DISCLAIMER } from "@/features/brand/brand-copy";

const DICTIONARY = new Set(["colour", "color", "centre", "center", "lived", "toronto"]);

describe("writing word count", () => {
  it("counts the sample sentence as 8 words", () => {
    expect(countWords("I've lived in Toronto for 3 years - it's well-known.")).toBe(8);
  });

  it("ignores punctuation-only tokens and blank text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("... ---")).toBe(0);
    expect(countWords("hello\n\nworld")).toBe(2);
  });
});

describe("score diagnostic", () => {
  it("names Speaking when it is the lowest score", () => {
    const verdict = diagnoseScores({
      Listening: 9,
      Reading: 8,
      Writing: 7,
      Speaking: 6,
    });
    expect(verdict?.headline).toContain("Speaking");
    expect(verdict?.tie).toBe(false);
  });

  it("rejects 3, 13 and blank fields", () => {
    const errors = validateDiagnosticScores({
      Listening: 3,
      Reading: 13,
      Writing: null,
      Speaking: 8,
    });
    expect(errors.map((error) => error.field)).toEqual([
      "Listening",
      "Reading",
      "Writing",
    ]);
  });

  it("names a tie and an all-equal set", () => {
    const tie = diagnoseScores({ Listening: 9, Reading: 9, Writing: 6, Speaking: 6 });
    expect(tie?.tie).toBe(true);
    expect(tie?.headline).toContain("Speaking and Writing");
    const equal = diagnoseScores({ Listening: 8, Reading: 8, Writing: 8, Speaking: 8 });
    expect(equal?.allEqual).toBe(true);
    expect(equal?.explanation).toContain("free mock");
  });
});

describe("draws", () => {
  it("filters by type, year and score and compares a short type", () => {
    const filtered = filterDraws(SEED_DRAWS, {
      types: ["Physicians"],
      year: 2026,
      minCrs: 100,
      maxCrs: 250,
    });
    expect(filtered).toHaveLength(1);
    const comparison = compareScore(
      [
        ...Array.from({ length: 5 }, (_, index) => ({
          id: String(index),
          drawDate: `2026-01-0${index + 1}`,
          drawType: "Physicians",
          invitations: 100,
          minCrs: 400 + index,
          tieBreak: null,
          sourceUrl: "https://example.com",
          updatedAt: "2026-01-01T00:00:00.000Z",
        })),
      ],
      478,
      12,
    );
    expect(comparison[0].label).toBe("the last 5");
  });

  it("blocks an impossible draw", () => {
    const errors = validateDrawInput({
      drawDate: "",
      drawType: "Canadian Experience Class",
      invitations: 0,
      minCrs: 1500,
    });
    expect(errors.map((error) => error.field)).toEqual([
      "drawDate",
      "invitations",
      "minCrs",
    ]);
  });
});

describe("study planner and dashboard next step", () => {
  it("tells a 5-day visitor not to learn anything new", () => {
    const weeks = buildStudyPlanner(
      { testDate: "2026-09-20", notBooked: false, target: "9", worry: "Speaking" },
      "2026-09-15",
    );
    expect(weeks[0].items[0]).toBe("Do not learn anything new.");
  });

  it("shows one under-7-days card and the first-timer card", () => {
    const soon = chooseNextStep({
      testDate: "2026-09-20",
      notBooked: false,
      target: "9",
      worry: "Speaking",
      firstTimer: false,
      speakingShortfalls: 0,
      today: "2026-09-15",
    });
    expect(soon.body).toContain("Do not learn anything new");
    expect(countdownLabel(5)).toBe("Your test is in 5 days");
    const first = chooseNextStep({
      testDate: null,
      notBooked: true,
      target: null,
      worry: null,
      firstTimer: true,
      speakingShortfalls: 0,
      today: "2026-09-15",
    });
    expect(first.body).toContain("free mock test");
    expect(first.href).toBe("/dashboard/mocks/mock-1");
  });

  it("formats free evaluations including grants", () => {
    expect(formatFreeEvaluations(2, 3, 0)).toBe("2 of 3 free evaluations left");
    expect(formatFreeEvaluations(4, 3, 2)).toContain("4");
    expect(allowanceReached(10, 10)).toBe(true);
  });
});

describe("results and access", () => {
  it("drops testimonials without consent and recomputes", () => {
    const hidden = { ...SEED_TESTIMONIALS[0], consentReceivedAt: null, published: true };
    const visible = publicTestimonials([hidden, ...SEED_TESTIMONIALS.slice(1)]);
    expect(visible.some((item) => item.id === hidden.id)).toBe(false);
    const stats = computeResultStats(SEED_TESTIMONIALS);
    expect(stats.verifiedShown).toBe(18);
    expect(filterTestimonials(SEED_TESTIMONIALS, "clb9").every((item) =>
      item.listening >= 9 && item.reading >= 9 && item.writing >= 9 && item.speaking >= 9,
    )).toBe(true);
  });

  it("colours rings from the score", () => {
    expect(scoreRingColor(9)).toBe("green");
    expect(scoreRingColor(8)).toBe("amber");
    expect(scoreRingColor(6)).toBe("red");
    expect(scoreRingFill(9)).toBeCloseTo(9 / 12);
  });

  it("locks paid areas for a free user and unlocks mocks for Test Sprint", () => {
    const free = { signedIn: true, verified: true, plans: ["free" as const] };
    expect(areaUnlocked(free, "mock_1")).toBe(true);
    expect(areaUnlocked(free, "mocks")).toBe(false);
    expect(areaUnlocked(free, "courses")).toBe(false);
    const sprint = { signedIn: true, verified: true, plans: ["test_sprint" as const] };
    expect(areaUnlocked(sprint, "mocks")).toBe(true);
    expect(areaUnlocked(sprint, "courses")).toBe(false);
  });
});

describe("spell check, instructions, mocks", () => {
  it("underlines teh and accepts both spellings and acronyms", () => {
    expect(isMisspelled("teh", DICTIONARY)).toBe(true);
    expect(isMisspelled("colour", DICTIONARY)).toBe(false);
    expect(isMisspelled("color", DICTIONARY)).toBe(false);
    expect(isMisspelled("CLB", DICTIONARY)).toBe(false);
    expect(isMisspelled("IRCC", DICTIONARY)).toBe(false);
  });

  it("fills timing tokens and has every screen key", () => {
    const texts = defaultInstructionTexts();
    expect(missingInstructionKeys(texts)).toEqual([]);
    expect(forbiddenPhraseCount(texts)).toBe(0);
    const body = instructionForMode(texts, "speaking.task1.prep", "practice");
    expect(renderInstruction(body ?? "", { prep_seconds: 45, record_seconds: 90 })).toContain("45");
    expect(instructionForMode(texts, "mode.practice.time_up", "test")).toBeNull();
    expect(instructionForMode(texts, "mode.test.advance", "test")).toContain("Audio plays once");
  });

  it("builds 50 mocks with the section counts", () => {
    const library = buildMockLibrary(50);
    expect(library).toHaveLength(50);
    expect(library[0].isFree).toBe(true);
    expect(validateMockStructure(buildMock(11))).toEqual([]);
    expect(markingSplit(10, 3)).toEqual({ now: 3, waiting: 7 });
  });
});

describe("reviews, booking, ask, plan, pdf", () => {
  it("rejects a short review and a future date", () => {
    const errors = validateReview({
      fullName: "Aman Singh",
      email: "aman@example.com",
      nameStyle: "first_initial",
      listening: 3,
      reading: 8,
      writing: 8,
      speaking: 8,
      testDate: "2026-10-01",
      before: null,
      firstAttempt: true,
      body: "Too short.",
      instagram: "",
      consentWebsite: false,
      consentInstagram: false,
      trap: "",
      today: "2026-09-29",
      minChars: 30,
      maxChars: 600,
      requireEmail: true,
    });
    expect(errors.some((error) => error.field === "listening")).toBe(true);
    expect(errors.some((error) => error.field === "testDate")).toBe(true);
    expect(errors.some((error) => error.field === "body")).toBe(true);
    expect(displayName("Aman Singh", "first_initial")).toBe("Aman S.");
    expect(reviewIsSpamTrap("bot")).toBe(true);
    expect(tokenExpired("2026-07-01T00:00:00.000Z", new Date("2026-09-29T00:00:00.000Z"), 60)).toBe(true);
    expect(sniffProofMime(new Uint8Array([0x4d, 0x5a]))).toBeNull();
  });

  it("names a Calgary zone and blocks a late reschedule", () => {
    const zoned = formatZonedRange(
      "2026-10-14T23:00:00.000Z",
      "2026-10-15T00:00:00.000Z",
      "America/Edmonton",
    );
    expect(zoned.local.toLowerCase()).toContain("mountain");
    expect(zoned.eastern).toContain("Eastern");
    const soon = new Date("2026-10-14T00:00:00.000Z");
    expect(canReschedule("2026-10-14T20:00:00.000Z", soon, 24)).toBe(false);
    expect(canReschedule("2026-10-16T20:00:00.000Z", soon, 24)).toBe(true);
  });

  it("limits questions and rejects a fake pdf", () => {
    expect(validateQuestion("hi")).not.toBeNull();
    expect(askRateLimited(5, 5)).toBe(true);
    expect(looksLikePdf(new Uint8Array([0x4d, 0x5a, 0, 0]))).toBe(false);
    expect(looksLikePdf(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBe(true);
  });

  it("builds a 3-week speaking plan and a pdf without the forbidden phrase", () => {
    const plan = buildStudyPlan(
      {
        testDate: "2026-10-19",
        today: "2026-09-29",
        weakest: "Speaking",
        dailyEvaluationLimit: 10,
        hasCourse: true,
      },
      { defaultWeeks: 4, finalDays: 7, fullMockUntilDays: 14 },
    );
    expect(new Set(plan.map((item) => item.week)).size).toBe(3);
    expect(plan.some((item) => item.label.includes("Test mode"))).toBe(true);
    expect(plan.filter((item) => item.week === 3 && item.kind === "lesson")).toHaveLength(0);
    const open = buildStudyPlan(
      {
        testDate: null,
        today: "2026-09-29",
        weakest: "Reading",
        dailyEvaluationLimit: 1,
        hasCourse: false,
      },
      { defaultWeeks: 4, finalDays: 7, fullMockUntilDays: 14 },
    );
    expect(new Set(open.map((item) => item.week)).size).toBe(4);
    const pair = comparePair(
      [
        { date: "2026-09-01", taskType: "speaking_task_1" },
        { date: "2026-09-20", taskType: "speaking_task_1" },
      ],
      7,
    );
    expect(pair?.earlier.date).toBe("2026-09-01");
    expect(pair?.later.date).toBe("2026-09-20");

    const pdf = buildEvaluationPdf({
      studentName: "Aman S.",
      task: "Writing Task 1",
      date: "2026-09-29",
      overall: 8,
      criteria: [
        { name: "Content and Coherence", level: 8, evidence: "Clear order.", gap: "Add a detail." },
        { name: "Vocabulary", level: 7, evidence: "Simple words.", gap: "Vary verbs." },
        { name: "Readability", level: 8, evidence: "Sentences are clear.", gap: "Join two ideas." },
        { name: "Task Fulfilment", level: 8, evidence: "The request is there.", gap: "State the ask earlier." },
      ],
      mistakes: ["a", "b", "c", "d", "e"],
      rewrites: ["Rewrite one.", "Rewrite two."],
      original: "Please call me.",
      deletions: ["Please"],
      insertions: ["Could you"],
      transcript: null,
      audioNotAssessed: false,
    });
    expect(evaluationPdfFilename("Writing Task 1", "2026-09-29")).toBe(
      "celpip-decoded-writing-task-1-2026-09-29.pdf",
    );
    expect(pdfContains(pdf, "your CELPIP score")).toBe(false);
    expect(pdfContains(pdf, PDF_FOOTER)).toBe(true);
    expect(pdfContains(pdf, "Deleted: Please")).toBe(true);
  });
});

describe("course languages, demo limits, account and seo", () => {
  it("keeps Punjabi coming soon and lists Tamil and Gujarati as follow-ons", () => {
    expect(switchLanguages(LANGUAGES).map((row) => row.code)).toEqual(["en", "hi", "pa"]);
    expect(followLine(LANGUAGES)).toBe("Tamil and Gujarati follow");
    expect(previewStopsAt(false, false, true)).toBe(true);
    expect(previewStopsAt(false, true, true)).toBe(false);
    expect(coverageGaps(miniCourseLibrary(["en", "hi"]), SKILL_TAGS, ["en", "hi"])).toEqual([]);
  });

  it("rate limits demo evaluations and rejects a long recording", () => {
    const buckets = new Map();
    expect(consumeRateLimit(buckets, "ip", 3, 0, 1000).allowed).toBe(true);
    expect(consumeRateLimit(buckets, "ip", 3, 10, 1000).allowed).toBe(true);
    expect(consumeRateLimit(buckets, "ip", 3, 20, 1000).allowed).toBe(true);
    expect(consumeRateLimit(buckets, "ip", 3, 30, 1000).allowed).toBe(false);
    expect(audioTooLong(100, 90, 5)).toBe(true);
    const feedback = buildDemoFeedback(70);
    expect(feedback.unlocked).toHaveLength(2);
    expect(feedback.locked.length).toBeGreaterThan(2);
  });

  it("expires codes, export links and requires DELETE", () => {
    expect(codeExpired(0, 16 * 60_000, 15)).toBe(true);
    expect(exportLinkExpired(0, 8 * 86_400_000, 7)).toBe(true);
    expect(deletionConfirmed(true, "DELETE")).toBe(true);
    expect(deletionConfirmed(true, "delete")).toBe(false);
  });

  it("builds FAQ schema from the same entries and records signup source", () => {
    const schema = faqJsonLd(FAQ_ENTRIES);
    expect(schema.mainEntity).toHaveLength(FAQ_ENTRIES.length);
    expect(schema.mainEntity[0].name).toBe(FAQ_ENTRIES[0].question);
    expect(signupStarted("header").props.source).toBe("header");
    expect(BRAND_DISCLAIMER).toContain("Paragon Testing Enterprises");
    expect(BRAND_DISCLAIMER.toLowerCase()).not.toContain("your celpip score");
  });
});
