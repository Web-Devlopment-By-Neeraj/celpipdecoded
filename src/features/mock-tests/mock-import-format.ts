// The file a client fills in, and the checklist that reads it back.
//
// Example rows are a guide for the person, or the AI, filling the file.
// They are never saved. A row with a problem is reported and nothing is
// written. A warning, such as a Listening part with no audio link, is
// reported and does not block the draft.
//
// House style: normal hyphens only, straight quotes only.

import {
  PART_TYPES_BY_SECTION,
  SECTION_TYPE_EXAM_ORDER,
  SECTION_TYPE_LABELS,
  type PartType,
  type SectionType,
} from "@/features/admin/mock-test-types";

export const IMPORT_COLUMNS = [
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
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number];

export type ImportIssue = {
  severity: "error" | "warning";
  message: string;
};

export type ImportQuestion = {
  number: number;
  prompt: string;
  options: { label: string; text: string }[];
  correctLabel: string;
  explanation: string | null;
};

export type ImportPart = {
  partType: PartType;
  title: string;
  content: string;
  audioUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  questions: ImportQuestion[];
};

export type ImportSection = {
  skill: SectionType;
  parts: ImportPart[];
};

export type ParsedMockImport = {
  issues: ImportIssue[];
  canSave: boolean;
  sections: ImportSection[];
};

export type MockImportActionState = {
  status: "idle" | "invalid" | "saved" | "error";
  message: string;
  issues: ImportIssue[];
};

export const idleMockImportState: MockImportActionState = {
  status: "idle",
  message: "",
  issues: [],
};

export type MockPublishState = {
  tone: "idle" | "ok" | "error";
  message: string;
};

export const idleMockPublishState: MockPublishState = {
  tone: "idle",
  message: "",
};

const OPTION_FIELDS = [
  ["option_a", "A"],
  ["option_b", "B"],
  ["option_c", "C"],
  ["option_d", "D"],
] as const;

const QUESTION_FIELDS = [
  "question_number",
  "prompt",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct",
  "explanation",
] as const;

type RawRow = Record<ImportColumn, string> & { line: number };

export function buildMockImportTemplate(): string {
  const header = IMPORT_COLUMNS.join(",");
  const rows = [
    exampleRow({
      skill: "listening",
      part_type: "listening_daily_conversation",
      part_title: "Example conversation",
      content: "Anna asks Ben which train they should take.",
      audio_url: "https://example.com/conversation.mp3",
      question_number: "1",
      prompt: "Which train do they choose?",
      option_a: "The early train",
      option_b: "The later train",
      option_c: "A bus",
      option_d: "A taxi",
      correct: "B",
      explanation: "Ben says the later train gives them time to buy tickets.",
    }),
    exampleRow({
      skill: "reading",
      part_type: "reading_correspondence",
      part_title: "Example email",
      content: "Priya writes to her neighbour about the garden.",
      question_number: "1",
      prompt: "Why is Priya writing?",
      option_a: "To sell the garden",
      option_b: "To ask for help with the garden",
      option_c: "To complain about noise",
      option_d: "To cancel a visit",
      correct: "B",
    }),
    exampleRow({
      skill: "reading",
      part_type: "reading_diagram",
      part_title: "Example diagram",
      content: "A map of the community centre.",
      image_url: "https://example.com/centre-map.png",
      image_alt: "A floor plan of the community centre with the gym on the left.",
      question_number: "1",
      prompt: "Where is the gym?",
      option_a: "On the left",
      option_b: "On the right",
      option_c: "Upstairs",
      option_d: "Outside",
      correct: "A",
    }),
    exampleRow({
      skill: "writing",
      part_type: "writing_email",
      part_title: "Example email task",
      content:
        "You missed a meeting at work. Write an email to your manager. Apologise, give a reason, and suggest a new time.",
      image_url: "https://example.com/office-note.png",
      image_alt: "A handwritten note on a desk that says the meeting moved to 3 pm.",
    }),
    exampleRow({
      skill: "speaking",
      part_type: "speaking_image_task",
      part_title: "Example picture task",
      content: "You are describing this place to a friend who has never been there.",
      image_url: "https://example.com/park.png",
      image_alt: "A city park with a pond, a path, and two people on a bench.",
    }),
  ];

  return `${header}\n${rows.join("\n")}\n`;
}

export function parseMockImportCsv(text: string): ParsedMockImport {
  const issues: ImportIssue[] = [];
  const table = parseCsv(stripBom(text));

  if (table.length === 0) {
    return refused(issues, "The file is empty.");
  }

  const header = table[0].map((cell) => cell.trim().toLowerCase());
  const missing = IMPORT_COLUMNS.filter((column) => !header.includes(column));

  if (missing.length > 0) {
    return refused(
      issues,
      `The file is missing ${missing.join(", ")}. Download the template and keep the header row.`,
    );
  }

  const index = new Map(header.map((name, position) => [name, position]));
  const dataRows: RawRow[] = [];

  table.slice(1).forEach((cells, offset) => {
    if (cells.every((cell) => cell.trim() === "")) {
      return;
    }

    const row = { line: offset + 2 } as RawRow;

    for (const column of IMPORT_COLUMNS) {
      row[column] = (cells[index.get(column) ?? -1] ?? "").trim();
    }

    if (row.use.toLowerCase() === "example") {
      return;
    }

    dataRows.push(row);
  });

  if (dataRows.length === 0) {
    return refused(
      issues,
      "The file has no practice content. Rows marked example are only a guide.",
    );
  }

  const parts = new Map<string, ImportPart & { skill: SectionType; line: number }>();
  const order: string[] = [];

  for (const row of dataRows) {
    const skill = row.skill.toLowerCase();

    if (!isSkill(skill)) {
      issues.push({
        severity: "error",
        message: `Row ${row.line}: skill must be listening, reading, writing or speaking.`,
      });
      continue;
    }

    const partType = row.part_type;

    if (!isPartTypeForSkill(skill, partType)) {
      issues.push({
        severity: "error",
        message: `Row ${row.line}: ${partType || "the part type"} is not a ${SECTION_TYPE_LABELS[skill]} part.`,
      });
      continue;
    }

    if (!row.part_title) {
      issues.push({
        severity: "error",
        message: `Row ${row.line}: enter a part title. Rows with the same title stay in one part.`,
      });
      continue;
    }

    const key = `${skill}\n${partType}\n${row.part_title}`;
    let part = parts.get(key);

    if (!part) {
      part = {
        skill,
        partType,
        title: row.part_title,
        content: "",
        audioUrl: null,
        imageUrl: null,
        imageAlt: null,
        questions: [],
        line: row.line,
      };
      parts.set(key, part);
      order.push(key);
    }

    applySharedFields(skill, part, row, issues);

    if (skill === "writing" || skill === "speaking") {
      const filled = QUESTION_FIELDS.some((field) => row[field] !== "");

      if (filled) {
        issues.push({
          severity: "error",
          message: `${labelFor(skill, part.title)} is a task, not a set of questions. Leave the question columns empty.`,
        });
      }

      continue;
    }

    addQuestion(skill, part, row, issues);
  }

  for (const key of order) {
    const part = parts.get(key);

    if (!part) {
      continue;
    }

    const where = labelFor(part.skill, part.title);

    if (!part.content) {
      issues.push({
        severity: "error",
        message:
          part.skill === "writing" || part.skill === "speaking"
            ? `${where} needs the task written in the content column.`
            : `${where} needs the passage or conversation in the content column.`,
      });
    }

    if (part.skill === "listening" && !part.audioUrl) {
      issues.push({
        severity: "warning",
        message: `${where} has no audio link. The conversation screen will have nothing to play.`,
      });
    }

    if (part.partType === "reading_diagram" && !part.imageUrl) {
      issues.push({
        severity: "error",
        message: `${where} needs an image link. A diagram part is answered from the picture.`,
      });
    }

    if (
      (part.partType === "speaking_image_task" ||
        part.partType === "speaking_comparison_task") &&
      !part.imageUrl
    ) {
      issues.push({
        severity: "warning",
        message: `${where} has no picture. The task will be spoken from the text only.`,
      });
    }

    if (part.imageUrl && !part.imageAlt) {
      issues.push({
        severity: "error",
        message: `${where} has a picture with no description. Fill in image_alt.`,
      });
    }

    if (
      part.skill !== "writing" &&
      part.skill !== "speaking" &&
      part.questions.length === 0 &&
      part.content
    ) {
      issues.push({
        severity: "error",
        message: `${where} needs at least one question.`,
      });
    }
  }

  const sections = assemble(order, parts);
  const errors = issues.filter((issue) => issue.severity === "error");

  return {
    issues,
    canSave: errors.length === 0 && sections.some((section) => section.parts.length > 0),
    sections: errors.length === 0 ? sections : [],
  };
}

function applySharedFields(
  skill: SectionType,
  part: ImportPart,
  row: RawRow,
  issues: ImportIssue[],
): void {
  if (row.content) {
    if (part.content && part.content !== row.content) {
      issues.push({
        severity: "error",
        message: `${labelFor(skill, part.title)} is listed twice with different text in the content column.`,
      });
    } else {
      part.content = row.content;
    }
  }

  part.audioUrl = firstUrl(part.audioUrl, row.audio_url, row, "audio_url", issues);
  part.imageUrl = firstUrl(part.imageUrl, row.image_url, row, "image_url", issues);

  if (row.image_alt) {
    part.imageAlt = part.imageAlt || row.image_alt;
  }
}

function addQuestion(
  skill: SectionType,
  part: ImportPart,
  row: RawRow,
  issues: ImportIssue[],
): void {
  const where = `${labelFor(skill, part.title)}, question`;
  const number = Number(row.question_number);

  if (!row.question_number || !Number.isInteger(number) || number < 1) {
    issues.push({
      severity: "error",
      message: `Row ${row.line}: enter a question number.`,
    });
    return;
  }

  if (part.questions.some((question) => question.number === number)) {
    issues.push({
      severity: "error",
      message: `${where} ${number} is listed twice.`,
    });
    return;
  }

  if (!row.prompt) {
    issues.push({
      severity: "error",
      message: `${where} ${number} has no prompt.`,
    });
  }

  const options = OPTION_FIELDS.flatMap(([field, label]) => {
    const text = row[field];
    return text ? [{ label, text }] : [];
  });

  if (!row.option_a || !row.option_b) {
    issues.push({
      severity: "error",
      message: `${where} ${number} needs option A and option B.`,
    });
  }

  const correct = row.correct.toUpperCase().replace(/\.$/, "");

  if (!correct) {
    issues.push({
      severity: "error",
      message: `${SECTION_TYPE_LABELS[skill]}, ${part.title}, question ${number} has no correct answer.`,
    });
  } else if (!["A", "B", "C", "D"].includes(correct)) {
    issues.push({
      severity: "error",
      message: `${where} ${number} must mark the correct answer as A, B, C or D.`,
    });
  } else if (!options.some((option) => option.label === correct)) {
    issues.push({
      severity: "error",
      message: `${SECTION_TYPE_LABELS[skill]}, ${part.title}, question ${number} option ${correct} is empty.`,
    });
  }

  if (!row.prompt || !correct || !["A", "B", "C", "D"].includes(correct)) {
    return;
  }

  if (!options.some((option) => option.label === correct)) {
    return;
  }

  part.questions.push({
    number,
    prompt: row.prompt,
    options,
    correctLabel: correct,
    explanation: row.explanation || null,
  });
}

function firstUrl(
  current: string | null,
  next: string,
  row: RawRow,
  field: "audio_url" | "image_url",
  issues: ImportIssue[],
): string | null {
  if (!next) {
    return current;
  }

  if (!/^https:\/\//i.test(next)) {
    issues.push({
      severity: "error",
      message: `Row ${row.line}: ${field} must be an https link.`,
    });
    return current;
  }

  return current || next;
}

function assemble(
  order: string[],
  parts: Map<string, ImportPart & { skill: SectionType }>,
): ImportSection[] {
  const bySkill = new Map<SectionType, ImportPart[]>();

  for (const key of order) {
    const part = parts.get(key);

    if (!part) {
      continue;
    }

    const list = bySkill.get(part.skill) ?? [];
    list.push({
      partType: part.partType,
      title: part.title,
      content: part.content,
      audioUrl: part.audioUrl,
      imageUrl: part.imageUrl,
      imageAlt: part.imageAlt,
      questions: [...part.questions].sort((a, b) => a.number - b.number),
    });
    bySkill.set(part.skill, list);
  }

  return [...bySkill.entries()]
    .sort(
      ([left], [right]) =>
        SECTION_TYPE_EXAM_ORDER[left] - SECTION_TYPE_EXAM_ORDER[right],
    )
    .map(([skill, skillParts]) => ({ skill, parts: skillParts }));
}

function refused(issues: ImportIssue[], message: string): ParsedMockImport {
  return {
    issues: [...issues, { severity: "error", message }],
    canSave: false,
    sections: [],
  };
}

function labelFor(skill: SectionType, title: string): string {
  return `${SECTION_TYPE_LABELS[skill]}, ${title}`;
}

function isSkill(value: string): value is SectionType {
  return (
    value === "listening" ||
    value === "reading" ||
    value === "writing" ||
    value === "speaking"
  );
}

function isPartTypeForSkill(skill: SectionType, value: string): value is PartType {
  return (PART_TYPES_BY_SECTION[skill] as readonly string[]).includes(value);
}

function exampleRow(values: Partial<Record<ImportColumn, string>>): string {
  return IMPORT_COLUMNS.map((column) =>
    csvCell(column === "use" ? "example" : (values[column] ?? "")),
  ).join(",");
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

// A small CSV reader. Quoted cells may contain commas and doubled quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }

      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }

    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
