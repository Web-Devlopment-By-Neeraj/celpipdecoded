export type InstructionMode = "both" | "practice" | "test";

export type InstructionText = {
  screenKey: string;
  mode: InstructionMode;
  body: string;
};

export type InstructionTokens = {
  prep_seconds?: number;
  record_seconds?: number;
  minutes?: number;
  question_count?: number;
};

const SCREEN_KEYS = [
  "test.introduction",
  "listening.instructions",
  "listening.part1.instructions",
  "listening.part1.question_line",
  "listening.part2.instructions",
  "listening.part3.instructions",
  "listening.part4.instructions",
  "listening.part4.dropdown_hint",
  "listening.part5.instructions",
  "listening.part6.instructions",
  "listening.end",
  "reading.instructions",
  "reading.part1.instructions",
  "reading.part2.instructions",
  "reading.part3.instructions",
  "reading.part4.instructions",
  "reading.dropdown_hint",
  "reading.end",
  "writing.instructions",
  "writing.task1.instructions",
  "writing.task2.choose",
  "writing.task2.instructions",
  "writing.end",
  "speaking.instructions",
  "speaking.task1.prep",
  "speaking.task1.record",
  "speaking.task2.prep",
  "speaking.task2.record",
  "speaking.task3.prep",
  "speaking.task3.record",
  "speaking.task4.prep",
  "speaking.task4.record",
  "speaking.task5.choose",
  "speaking.task5.compare",
  "speaking.task5.prep",
  "speaking.task5.record",
  "speaking.task6.prep",
  "speaking.task6.record",
  "speaking.task7.prep",
  "speaking.task7.record",
  "speaking.task8.prep",
  "speaking.task8.record",
  "speaking.end",
  "mode.practice.time_up",
  "mode.practice.record_again",
  "mode.test.advance",
] as const;

export function instructionScreenKeys(): readonly string[] {
  return SCREEN_KEYS;
}

function line(screenKey: string, mode: InstructionMode, body: string): InstructionText {
  return { screenKey, mode, body };
}

export function defaultInstructionTexts(): InstructionText[] {
  const both: InstructionText[] = SCREEN_KEYS.filter(
    (key) => !key.startsWith("mode."),
  ).map((key) =>
    line(
      key,
      "both",
      defaultBody(key),
    ),
  );

  return [
    ...both,
    line(
      "mode.practice.time_up",
      "practice",
      "Time is up. On the real test this screen would move on by itself. Press Next when you are ready.",
    ),
    line(
      "mode.practice.record_again",
      "practice",
      "You can record again. Only the take you submit is marked.",
    ),
    line(
      "mode.test.advance",
      "test",
      "Audio plays once. When time ends, the next screen opens on its own.",
    ),
  ];
}

function defaultBody(key: string): string {
  if (key === "speaking.task1.prep" || key === "speaking.task1.record") {
    return "You have {prep_seconds} seconds to prepare and {record_seconds} seconds to speak. The prompt stays on screen. This is practice, and any level you see later is a practice estimate.";
  }
  if (key === "speaking.task5.choose") {
    return "Choose one option. Do not speak yet. You will have {prep_seconds} seconds to prepare after you choose.";
  }
  if (key === "speaking.task5.compare") {
    return "Compare the options in front of you, then give your choice and your reasons.";
  }
  if (key.endsWith(".question_line") || key.endsWith("dropdown_hint")) {
    return "Choose the best answer for this practice item.";
  }
  if (key.endsWith(".end")) {
    return "This part of the practice test is finished. Writing and speaking feedback appears as marking finishes. Every level is a practice estimate.";
  }
  if (key.startsWith("writing.")) {
    return "You have {minutes} minutes. Type your answer in your own words. Nothing is corrected for you. The word count is there so you can see length, not to block you.";
  }
  return "Read this screen, then press Next. You will have {minutes} minutes and {question_count} questions in this practice part. This is CELPIP Decoded practice, not the official test.";
}

export function renderInstruction(body: string, tokens: InstructionTokens): string {
  return body.replace(/\{(prep_seconds|record_seconds|minutes|question_count)\}/g, (_, key: keyof InstructionTokens) => {
    const value = tokens[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function instructionForMode(
  texts: InstructionText[],
  screenKey: string,
  mode: "practice" | "test",
): string | null {
  const exact = texts.find((item) => item.screenKey === screenKey && item.mode === mode);
  if (exact) return exact.body;
  const shared = texts.find((item) => item.screenKey === screenKey && item.mode === "both");
  return shared?.body ?? null;
}

export function missingInstructionKeys(texts: InstructionText[]): string[] {
  return SCREEN_KEYS.filter((key) => {
    if (key.startsWith("mode.practice")) {
      return !texts.some((item) => item.screenKey === key && item.mode === "practice");
    }
    if (key.startsWith("mode.test")) {
      return !texts.some((item) => item.screenKey === key && item.mode === "test");
    }
    return !texts.some((item) => item.screenKey === key);
  });
}

export function forbiddenPhraseCount(texts: InstructionText[]): number {
  return texts.filter((item) => item.body.toLowerCase().includes("your celpip score")).length;
}
