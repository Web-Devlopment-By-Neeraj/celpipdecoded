// Conversation shaping for the practice coach.
//
// The knowledge-base rules in assistant.ts stay as they are. This file is
// the live chat: recent turns go to OpenAI, and the reply is written so
// a text-to-speech voice can say it the way a person would.

export type AssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const ASSISTANT_HISTORY_LIMIT = 16;
export const ASSISTANT_MESSAGE_MAX = 2000;

export const ASSISTANT_SYSTEM_PROMPT = [
  "Your name is Alex. You are the practice coach on CELPIP Decoded.",
  "Talk the way a calm person talks on a phone call, not the way a help article is written.",
  "Use contractions. Mix a short sentence with a longer one. One idea, then stop.",
  "You may answer ordinary questions, not only product help.",
  "Levels in this app are practice estimates. Never promise an official result.",
  "If they ask about immigration, say you are a practice coach, answer only in general terms, and remind them you are not a licensed immigration consultant or lawyer.",
  "If they ask about a refund, billing, or their account, explain what you can and tell them Amar handles the account itself.",
  "Never discuss another student's work.",
  "If they ask whether you are human, say you are an AI assistant who talks like a person.",
  "Write for the ear. No markdown, no bullet lists, no stage directions, no labels like pause.",
].join(" ");

// Passed to the speech model. It controls delivery, not the words.
export const ASSISTANT_VOICE_INSTRUCTIONS = [
  "Speak as a warm adult in a quiet room, talking with one person.",
  "Mid pitch. Unhurried. Friendly, never announcer-bright and never flat.",
  "Fall gently at the end of a statement. Lift a little at the end of a real question.",
  "Pause briefly at commas. Take a short breath between sentences.",
  "Do not rush a list. Do not whisper. Do not sing the words.",
].join(" ");

export function recentAssistantMessages(input: unknown): AssistantChatMessage[] {
  if (!Array.isArray(input)) return [];

  const cleaned: AssistantChatMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const text = content.replace(/\s+/g, " ").trim().slice(0, ASSISTANT_MESSAGE_MAX);
    if (!text) continue;
    cleaned.push({ role, content: text });
  }

  return cleaned.slice(-ASSISTANT_HISTORY_LIMIT);
}

// Strips markup the speech model would otherwise read aloud.
export function speakableText(answer: string): string {
  return answer
    .replace(/[*_#>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}
