import { describe, expect, it } from "vitest";
import type { MockTestPartContent } from "@/features/admin/mock-test-content-types";
import {
  assembleLearnerMockTest,
  buildMockTestHub,
  gradeObjectiveAnswers,
  publishBlockers,
  type PublishPartInput,
  type PublishedMockBundle,
} from "./published-mock-catalog";

function objectiveContent(
  answerKey: MockTestPartContent["questions"][number]["answerKey"],
): MockTestPartContent {
  return {
    media: [],
    questions: [
      {
        id: "q1",
        mock_test_id: "t",
        section_id: "s",
        part_id: "p",
        question_type: "single_choice",
        question_number: 1,
        prompt: "What happened?",
        instruction: null,
        passage_text: null,
        stem: null,
        helper_text: null,
        media_asset_id: null,
        points: 1,
        display_order: 1,
        is_required: true,
        status: "ready",
        options: [
          {
            id: "opt-a",
            question_id: "q1",
            option_label: "A",
            option_text: "Yes",
            display_order: 1,
          },
          {
            id: "opt-b",
            question_id: "q1",
            option_label: "B",
            option_text: "No",
            display_order: 2,
          },
        ],
        answerKey,
      },
    ],
  };
}

function part(overrides: Partial<PublishPartInput> = {}): PublishPartInput {
  return {
    title: "Part 1",
    sectionType: "listening",
    instructions: "Listen to the clip.",
    content: objectiveContent({
      id: "k1",
      question_id: "q1",
      correct_option_id: "opt-a",
      correct_text: null,
      explanation: "The speaker said yes.",
      points: 1,
    }),
    ...overrides,
  };
}

describe("assembleLearnerMockTest", () => {
  it("drops answer keys, transcripts and staff notes", () => {
    const bundle = {
      test: {
        id: "t",
        slug: "mock-test-2",
        title: "Mock Test 2",
        description: "A second practice test.",
        internal_notes: "staff-only-note",
      },
      sections: [
        {
          id: "s",
          mock_test_id: "t",
          section_type: "listening",
          title: "Listening",
          instructions: "You will hear a conversation.",
          section_order: 1,
        },
      ],
      parts: [
        {
          id: "p",
          section_id: "s",
          title: "Problem solving",
          part_type: "listening_problem_solving",
          instructions: "Listen.",
          part_order: 1,
          prep_time_seconds: null,
          response_time_seconds: 60,
        },
      ],
      questions: [
        {
          id: "q1",
          part_id: "p",
          question_type: "single_choice",
          question_number: 1,
          prompt: "Where are they?",
          instruction: null,
          passage_text: null,
          stem: null,
          helper_text: null,
          points: 1,
          display_order: 1,
          answerKey: { correct_option_id: "opt-a" },
          explanation: "leak-explanation",
        },
      ],
      options: [
        {
          id: "opt-a",
          question_id: "q1",
          option_label: "A",
          option_text: "At home",
          display_order: 1,
        },
      ],
      media: [
        {
          id: "m1",
          part_id: "p",
          media_type: "audio",
          url: "https://res.cloudinary.com/demo/video/upload/clip.mp3",
          title: "Clip",
          alt_text: null,
          display_order: 1,
          transcript: "the answer is at home",
          internal_notes: "do not show",
        },
      ],
    } as unknown as PublishedMockBundle;

    const test = assembleLearnerMockTest(bundle);
    const json = JSON.stringify(test);

    expect(json).not.toContain("staff-only-note");
    expect(json).not.toContain("leak-explanation");
    expect(json).not.toContain("correct_option");
    expect(json).not.toContain("answerKey");
    expect(json).not.toContain("transcript");
    expect(json).not.toContain("the answer is at home");
    expect(json).not.toContain("do not show");
    expect(test.sections[0]?.parts[0]?.questions[0]?.prompt).toBe(
      "Where are they?",
    );
    expect(test.sections[0]?.parts[0]?.media[0]?.url).toContain("clip.mp3");
  });
});

describe("buildMockTestHub", () => {
  it("replaces the mock-test-2 card and keeps later placeholders", () => {
    const entries = buildMockTestHub([
      {
        slug: "mock-test-2",
        title: "Mock Test 2",
        description: null,
        sectionTypes: ["listening", "reading"],
      },
      {
        slug: "weekend-set",
        title: "Weekend set",
        description: null,
        sectionTypes: ["writing"],
      },
    ]);

    expect(entries.map((entry) => entry.kind === "placeholder" ? `placeholder-${entry.slot}` : entry.test.slug)).toEqual([
      "mock-test-2",
      "placeholder-3",
      "placeholder-4",
      "placeholder-5",
      "weekend-set",
    ]);
  });

  it("ignores a published row that reuses the built-in mock-test-1 slug", () => {
    const entries = buildMockTestHub([
      {
        slug: "mock-test-1",
        title: "Should not replace the free test",
        description: null,
        sectionTypes: ["listening"],
      },
    ]);

    expect(entries.every((entry) => entry.kind === "placeholder")).toBe(true);
  });
});

describe("publishBlockers", () => {
  it("allows a listening part that has a question and an answer key", () => {
    expect(
      publishBlockers({
        slug: "mock-test-2",
        structureErrorCount: 0,
        parts: [part()],
      }),
    ).toEqual([]);
  });

  it("refuses the built-in slug, a missing key, and an empty listening part", () => {
    const blockers = publishBlockers({
      slug: "mock-test-1",
      structureErrorCount: 0,
      parts: [
        part({
          content: objectiveContent(null),
        }),
        part({
          title: "Reading part",
          sectionType: "reading",
          content: { media: [], questions: [] },
        }),
      ],
    });

    expect(blockers.some((line) => line.includes("mock-test-1"))).toBe(true);
    expect(blockers.some((line) => line.includes("no answer key"))).toBe(true);
    expect(blockers.some((line) => line.includes("Reading part"))).toBe(true);
  });

  it("allows a writing part that is only a task prompt", () => {
    expect(
      publishBlockers({
        slug: "mock-test-3",
        structureErrorCount: 0,
        parts: [
          part({
            title: "Email",
            sectionType: "writing",
            instructions: "Write an email to your manager about the schedule.",
            content: { media: [], questions: [] },
          }),
        ],
      }),
    ).toEqual([]);
  });
});

describe("gradeObjectiveAnswers", () => {
  const questions = assembleLearnerMockTest({
    test: {
      id: "t",
      slug: "mock-test-2",
      title: "Mock Test 2",
      description: null,
    },
    sections: [
      {
        id: "s",
        mock_test_id: "t",
        section_type: "reading",
        title: "Reading",
        instructions: null,
        section_order: 1,
      },
    ],
    parts: [
      {
        id: "p",
        section_id: "s",
        title: "Correspondence",
        part_type: "reading_correspondence",
        instructions: null,
        part_order: 1,
        prep_time_seconds: null,
        response_time_seconds: null,
      },
    ],
    questions: [
      {
        id: "q1",
        part_id: "p",
        question_type: "single_choice",
        question_number: 1,
        prompt: "Why did she write?",
        instruction: null,
        passage_text: null,
        stem: null,
        helper_text: null,
        points: 1,
        display_order: 1,
      },
    ],
    options: [
      {
        id: "opt-a",
        question_id: "q1",
        option_label: "A",
        option_text: "To ask for help",
        display_order: 1,
      },
      {
        id: "opt-b",
        question_id: "q1",
        option_label: "B",
        option_text: "To cancel",
        display_order: 2,
      },
    ],
    media: [],
  }).sections[0]!.parts[0]!.questions;

  it("marks the chosen option and names the correct one", () => {
    const graded = gradeObjectiveAnswers(
      questions,
      [
        {
          questionId: "q1",
          correctOptionId: "opt-a",
          explanation: "The letter asks for help.",
        },
      ],
      { q1: "opt-b" },
    );

    expect(graded.correctCount).toBe(0);
    expect(graded.results[0]).toMatchObject({
      correct: false,
      correctLabel: "A. To ask for help",
      explanation: "The letter asks for help.",
    });
  });
});
