export type PdfEvaluation = {
  studentName: string;
  task: string;
  date: string;
  overall: number;
  criteria: { name: string; level: number; evidence: string; gap: string }[];
  mistakes: string[];
  rewrites: string[];
  original: string;
  deletions: string[];
  insertions: string[];
  transcript: string | null;
  audioNotAssessed: boolean;
};

export const PDF_FOOTER =
  "Practice estimate, not a CELPIP score. CELPIP is a registered trademark of Paragon Testing Enterprises, a subsidiary of the University of British Columbia. CELPIP Decoded is independent and not affiliated with or endorsed by Paragon.";

export function evaluationPdfFilename(task: string, date: string): string {
  const slug = task.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `celpip-decoded-${slug}-${date}.pdf`;
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildEvaluationPdf(input: PdfEvaluation): Uint8Array {
  const lines = [
    "CELPIP Decoded",
    "Practice estimate",
    `${input.studentName} · ${input.task} · ${input.date}`,
    `Overall practice estimate: ${input.overall}`,
    ...input.criteria.map(
      (item) =>
        `${item.name}: practice estimate ${item.level}. Evidence: ${item.evidence} Next-level gap: ${item.gap}`,
    ),
    "Top mistakes:",
    ...input.mistakes.map((item) => `- ${item}`),
    "Rewrites:",
    ...input.rewrites.map((item) => `- ${item}`),
    `Original: ${input.original}`,
    ...input.deletions.map((item) => `Deleted: ${item}`),
    ...input.insertions.map((item) => `Inserted: ${item}`),
    input.transcript ? `Transcript: ${input.transcript}` : "",
    input.audioNotAssessed ? "Audio was not assessed." : "",
    PDF_FOOTER,
  ].filter(Boolean);

  const content = lines
    .map((line, index) => {
      const y = 760 - index * 16;
      return `BT /F1 11 Tf 48 ${y} Td (${escapePdf(line)}) Tj ET`;
    })
    .join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function pdfContains(bytes: Uint8Array, phrase: string): boolean {
  return new TextDecoder().decode(bytes).includes(phrase);
}
