import { describe, expect, it } from "vitest";
import {
  buildMockImportTemplate,
  parseMockImportCsv,
} from "./mock-import-format";

function csv(rows: string[][]): string {
  const header = [
    "use",
    "skill",
    "part_type",
    "part_title",
    "content",
    "audio_url",
    "image_url",
    "image_alt",
    "question_number",
    "prompt",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct",
    "explanation",
  ];

  return [header, ...rows].map((row) => row.join(",")).join("\n");
}

const listeningQuestion = [
  "",
  "listening",
  "listening_daily_conversation",
  "Train chat",
  "Anna asks Ben which train to take.",
  "https://example.com/train.mp3",
  "",
  "",
  "1",
  "Which train do they choose?",
  "The early train",
  "The later train",
  "A bus",
  "A taxi",
  "B",
  "Ben wants time to buy tickets.",
];

describe("parseMockImportCsv", () => {
  it("ignores the example rows in the template", () => {
    const parsed = parseMockImportCsv(buildMockImportTemplate());

    expect(parsed.canSave).toBe(false);
    expect(parsed.sections).toEqual([]);
    expect(parsed.issues.some((issue) => issue.message.includes("example"))).toBe(
      true,
    );
  });

  it("saves a clean listening question and keeps a missing audio link as a warning", () => {
    const withAudio = parseMockImportCsv(csv([listeningQuestion]));

    expect(withAudio.canSave).toBe(true);
    expect(withAudio.issues).toEqual([]);
    expect(withAudio.sections[0]?.parts[0]?.questions[0]?.correctLabel).toBe("B");

    const quiet = [...listeningQuestion];
    quiet[5] = "";
    const withoutAudio = parseMockImportCsv(csv([quiet]));

    expect(withoutAudio.canSave).toBe(true);
    expect(withoutAudio.issues).toEqual([
      {
        severity: "warning",
        message:
          "Listening, Train chat has no audio link. The conversation screen will have nothing to play.",
      },
    ]);
  });

  it("blocks a missing correct answer and an empty chosen option", () => {
    const noKey = [...listeningQuestion];
    noKey[14] = "";
    const missingKey = parseMockImportCsv(csv([noKey]));

    expect(missingKey.canSave).toBe(false);
    expect(missingKey.sections).toEqual([]);
    expect(missingKey.issues.map((issue) => issue.message)).toContain(
      "Listening, Train chat, question 1 has no correct answer.",
    );

    const emptyC = [...listeningQuestion];
    emptyC[12] = "";
    emptyC[14] = "C";
    const missingOption = parseMockImportCsv(csv([emptyC]));

    expect(missingOption.issues.map((issue) => issue.message)).toContain(
      "Listening, Train chat, question 1 option C is empty.",
    );
  });

  it("treats a writing row as a task and refuses question columns on it", () => {
    const task = parseMockImportCsv(
      csv([
        [
          "",
          "writing",
          "writing_email",
          "Missed meeting",
          "You missed a meeting. Write to your manager.",
          "",
          "https://example.com/note.png",
          "A note that says the meeting moved to 3 pm.",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
      ]),
    );

    expect(task.canSave).toBe(true);
    expect(task.sections[0]?.parts[0]?.questions).toEqual([]);

    const withQuestion = parseMockImportCsv(
      csv([
        [
          "",
          "writing",
          "writing_email",
          "Missed meeting",
          "You missed a meeting. Write to your manager.",
          "",
          "",
          "",
          "1",
          "What do you write?",
          "An email",
          "A text",
          "",
          "",
          "A",
          "",
        ],
      ]),
    );

    expect(withQuestion.canSave).toBe(false);
    expect(withQuestion.issues[0]?.message).toContain("not a set of questions");
  });

  it("keeps two questions with the same part title in one part", () => {
    const second = [...listeningQuestion];
    second[8] = "2";
    second[9] = "Why do they wait?";
    second[14] = "A";
    const parsed = parseMockImportCsv(csv([listeningQuestion, second]));

    expect(parsed.canSave).toBe(true);
    expect(parsed.sections[0]?.parts).toHaveLength(1);
    expect(parsed.sections[0]?.parts[0]?.questions.map((question) => question.number)).toEqual([
      1, 2,
    ]);
  });
});
