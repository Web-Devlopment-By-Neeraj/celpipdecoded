export const WRITING_CHAR_CAP = 10_000;

export function clampWritingText(text: string): string {
  return text.slice(0, WRITING_CHAR_CAP);
}

export const SPELLCHECK_ATTRIBUTES = {
  spellCheck: false,
  autoCorrect: "off",
  autoCapitalize: "off",
  autoComplete: "off",
  "data-gramm": "false",
  "data-gramm_editor": "false",
  "data-enable-grammarly": "false",
  inputMode: "text",
} as const;
