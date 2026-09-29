export type MockSection = "listening" | "reading" | "writing" | "speaking";

export type MockQuestion = {
  id: string;
  section: MockSection;
  part: number;
  prompt: string;
  options: string[];
  answerIndex: number;
  skillTag: string;
  explanation: string;
};

export type MockDefinition = {
  id: string;
  ordinal: number;
  title: string;
  isFree: boolean;
  published: boolean;
  version: number;
  questions: MockQuestion[];
  writingPrompts: string[];
  speakingPrompts: string[];
  licenceNote: string;
};

const LISTENING_COUNTS = [8, 5, 6, 5, 8, 6];
const READING_COUNTS = [11, 8, 9, 10];

const LISTENING_TAGS = ["main idea", "detail", "inference", "speaker purpose", "prediction"];
const READING_TAGS = ["main idea", "detail", "inference", "vocabulary in context", "paragraph match"];

export function buildMock(ordinal: number): MockDefinition {
  const questions: MockQuestion[] = [];
  LISTENING_COUNTS.forEach((count, partIndex) => {
    for (let index = 0; index < count; index += 1) {
      questions.push(
        question(ordinal, "listening", partIndex + 1, index, LISTENING_TAGS[index % LISTENING_TAGS.length]),
      );
    }
  });
  READING_COUNTS.forEach((count, partIndex) => {
    for (let index = 0; index < count; index += 1) {
      questions.push(
        question(ordinal, "reading", partIndex + 1, index, READING_TAGS[index % READING_TAGS.length]),
      );
    }
  });

  return {
    id: `mock-${ordinal}`,
    ordinal,
    title: `Mock test ${ordinal}`,
    isFree: ordinal === 1,
    published: true,
    version: 1,
    questions,
    writingPrompts: [
      `Write an email about a community centre change in practice set ${ordinal}. Ask for one clear action.`,
      `Write about whether a town should add a weekend bus in practice set ${ordinal}.`,
      `Write about whether a library should stay open later in practice set ${ordinal}.`,
    ],
    speakingPrompts: Array.from({ length: 8 }, (_, index) =>
      `Speaking task ${index + 1} in practice set ${ordinal}: describe the situation in your own words and give one reason.`,
    ),
    licenceNote: "Original CELPIP Decoded practice text. No third-party test material.",
  };
}

function question(
  ordinal: number,
  section: MockSection,
  part: number,
  index: number,
  skillTag: string,
): MockQuestion {
  const id = `${section}-${ordinal}-${part}-${index + 1}`;
  return {
    id,
    section,
    part,
    prompt: `Practice set ${ordinal}, ${section} part ${part}, item ${index + 1}: which statement matches the plan the speakers agreed on?`,
    options: [
      "They will meet on Friday morning.",
      "They will cancel the visit.",
      "They will move the visit to next month.",
      "They will ask a different person to decide.",
    ],
    answerIndex: index % 4,
    skillTag,
    explanation: "The agreed plan is the option that repeats the time they both accepted.",
  };
}

export function validateMockStructure(mock: MockDefinition): string[] {
  const errors: string[] = [];
  const listening = mock.questions.filter((item) => item.section === "listening");
  const reading = mock.questions.filter((item) => item.section === "reading");
  if (listening.length !== 38) errors.push("Listening must have 38 questions.");
  if (reading.length !== 38) errors.push("Reading must have 38 questions.");
  LISTENING_COUNTS.forEach((count, index) => {
    const found = listening.filter((item) => item.part === index + 1).length;
    if (found !== count) errors.push(`Listening part ${index + 1} has ${found}, expected ${count}.`);
  });
  READING_COUNTS.forEach((count, index) => {
    const found = reading.filter((item) => item.part === index + 1).length;
    if (found !== count) errors.push(`Reading part ${index + 1} has ${found}, expected ${count}.`);
  });
  if (mock.writingPrompts.length < 3) errors.push("Writing needs task 1 and two task 2 options.");
  if (mock.speakingPrompts.length !== 8) errors.push("Speaking needs 8 tasks.");
  if (mock.questions.some((item) => !item.skillTag || !item.explanation)) {
    errors.push("Every question needs a skill tag and an explanation.");
  }
  if (mock.questions.some((item) => item.prompt.toLowerCase().includes("your celpip score"))) {
    errors.push("Forbidden phrase in a prompt.");
  }
  return errors;
}

export function buildMockLibrary(count: number): MockDefinition[] {
  return Array.from({ length: count }, (_, index) => buildMock(index + 1));
}

export const RETAKE_TIP_DAYS = 10;

export function retakeDue(submittedAt: string, now: Date, days = RETAKE_TIP_DAYS): boolean {
  return now.getTime() - Date.parse(submittedAt) >= days * 86_400_000;
}

export type AttemptScope = "complete" | "listening" | "reading" | "writing" | "speaking";

export function evaluationsNeeded(scope: AttemptScope): number {
  if (scope === "writing") return 2;
  if (scope === "speaking") return 8;
  if (scope === "complete") return 10;
  return 0;
}

export function markingSplit(needed: number, remaining: number): { now: number; waiting: number } {
  const now = Math.max(0, Math.min(needed, remaining));
  return { now, waiting: needed - now };
}
