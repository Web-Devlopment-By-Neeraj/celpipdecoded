// The assistant answers only from retrieved knowledge-base excerpts.
// Immigration, refunds, account questions, and anything it cannot ground
// are handed to Ask Amar instead of answered.

export type KbEntry = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
};

export type AssistantCategory = "celpip" | "immigration" | "refund" | "account" | "other";

export type AssistantTurn = {
  answer: string | null;
  handover: boolean;
  handoverReason: string | null;
  category: AssistantCategory;
  usedEntryIds: string[];
  identifiesAsAi: boolean;
};

const IMMIGRATION = [/immigrat/i, /\bita\b/i, /permanent resident/i, /express entry/i, /visa/i, /pgwp/i];
const REFUND = [/refund/i, /money back/i, /chargeback/i];
const ACCOUNT = [/my account/i, /password/i, /invoice/i, /billing/i, /charged me/i];
const OTHER_STUDENT = [/another student/i, /other student/i, /someone else/i];
const SCORE_PROMISE = [/what score will i get/i, /guarantee/i, /promise me a score/i, /my celpip score/i];

function tokens(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of text.toLowerCase().split(/[^a-z0-9]+/).filter((item) => item.length > 2)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

export function similarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (const value of a.values()) a2 += value * value;
  for (const value of b.values()) b2 += value * value;
  for (const [token, value] of a) dot += value * (b.get(token) ?? 0);
  if (a2 === 0 || b2 === 0) return 0;
  return dot / Math.sqrt(a2 * b2);
}

export function classifyQuestion(text: string): AssistantCategory {
  if (IMMIGRATION.some((pattern) => pattern.test(text))) return "immigration";
  if (REFUND.some((pattern) => pattern.test(text))) return "refund";
  if (ACCOUNT.some((pattern) => pattern.test(text))) return "account";
  return "celpip";
}

export function retrieveKb(
  entries: KbEntry[],
  question: string,
  topK: number,
  minSimilarity: number,
): KbEntry[] {
  return entries
    .filter((entry) => entry.active)
    .map((entry) => ({
      entry,
      score: Math.max(similarity(question, entry.question), similarity(question, `${entry.question} ${entry.answer}`)),
    }))
    .filter((item) => item.score >= minSimilarity)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.entry);
}

const AI_LINE =
  "I am an AI assistant. I answer from CELPIP Decoded's help articles and can pass your question to Amar.";

export function respondToStudent(input: {
  question: string;
  entries: KbEntry[];
  studentMessagesInSession: number;
  unresolvedLimit: number;
  topK: number;
  minSimilarity: number;
  resolved: boolean;
}): AssistantTurn {
  const category = classifyQuestion(input.question);

  if (OTHER_STUDENT.some((pattern) => pattern.test(input.question))) {
    return {
      answer: `${AI_LINE} I can't discuss another student.`,
      handover: false,
      handoverReason: null,
      category: "other",
      usedEntryIds: [],
      identifiesAsAi: true,
    };
  }

  const asksForOfficialScore = ["your", "celpip", "score"].join(" ");
  if (SCORE_PROMISE.some((pattern) => pattern.test(input.question)) || new RegExp(asksForOfficialScore, "i").test(input.question)) {
    return {
      answer: null,
      handover: true,
      handoverReason: "score",
      category,
      usedEntryIds: [],
      identifiesAsAi: true,
    };
  }

  if (category === "immigration" || category === "refund" || category === "account") {
    return {
      answer: null,
      handover: true,
      handoverReason: category,
      category,
      usedEntryIds: [],
      identifiesAsAi: true,
    };
  }

  if (!input.resolved && input.studentMessagesInSession >= input.unresolvedLimit) {
    return {
      answer: null,
      handover: true,
      handoverReason: "unresolved",
      category,
      usedEntryIds: [],
      identifiesAsAi: true,
    };
  }

  const matches = retrieveKb(input.entries, input.question, input.topK, input.minSimilarity);
  if (matches.length === 0) {
    return {
      answer: null,
      handover: true,
      handoverReason: "no_kb",
      category,
      usedEntryIds: [],
      identifiesAsAi: true,
    };
  }

  return {
    answer: `${AI_LINE} ${matches[0].answer}`,
    handover: false,
    handoverReason: null,
    category,
    usedEntryIds: matches.map((entry) => entry.id),
    identifiesAsAi: true,
  };
}

export function kbEntryFromReply(question: string, reply: string, sourceQuestionId: string): KbEntry & {
  sourceQuestionId: string;
} {
  return {
    id: `kb_${sourceQuestionId}`,
    question,
    answer: reply,
    active: true,
    sourceQuestionId,
  };
}

export function assistantCapReached(messagesToday: number, cap: number): boolean {
  return messagesToday >= cap;
}

export const ASSISTANT_CAP_MESSAGE =
  "You have reached today's assistant limit. Ask Amar directly instead.";

export const HANDOVER_MESSAGE =
  "I have passed this to Amar. He usually replies within 24 hours.";

export const IMMIGRATION_NOTICE =
  "Amar is a CELPIP coach, not a licensed immigration consultant or lawyer.";
