import { NextResponse } from "next/server";
import { buildEvaluationPdf, evaluationPdfFilename } from "@/features/public-site/pdf";

export async function GET() {
  const bytes = buildEvaluationPdf({
    studentName: "Student",
    task: "Writing Task 1",
    date: new Date().toISOString().slice(0, 10),
    overall: 7,
    criteria: [
      { name: "Content and Coherence", level: 7, evidence: "The order is clear.", gap: "Add one detail." },
      { name: "Vocabulary", level: 7, evidence: "Words are simple.", gap: "Vary the verbs." },
      { name: "Readability", level: 7, evidence: "Sentences are readable.", gap: "Join two short lines." },
      { name: "Task Fulfilment", level: 7, evidence: "The request is present.", gap: "Put the ask first." },
    ],
    mistakes: ["One", "Two", "Three", "Four", "Five"],
    rewrites: ["First rewrite.", "Second rewrite."],
    original: "Please call me back.",
    deletions: ["Please"],
    insertions: ["Could you"],
    transcript: null,
    audioNotAssessed: false,
  });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${evaluationPdfFilename("Writing Task 1", new Date().toISOString().slice(0, 10))}"`,
    },
  });
}
