import { describe, expect, it } from "vitest";
import {
  ASSISTANT_HISTORY_LIMIT,
  createAssistantReply,
  readModelText,
  recentAssistantMessages,
  speakableText,
} from "./assistant-conversation";

describe("assistant conversation", () => {
  it("keeps only the recent spoken turns", () => {
    const input = Array.from({ length: ASSISTANT_HISTORY_LIMIT + 4 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `turn ${index}`,
    }));
    const recent = recentAssistantMessages(input);
    expect(recent).toHaveLength(ASSISTANT_HISTORY_LIMIT);
    expect(recent[0]?.content).toBe("turn 4");
    expect(recentAssistantMessages([{ role: "system", content: "nope" }, { role: "user", content: "  hi  " }])).toEqual([
      { role: "user", content: "hi" },
    ]);
  });

  it("prepares a reply for speech", () => {
    expect(speakableText("**Hello**  there\nfriend")).toBe("Hello there friend");
  });

  it("reads a string or a list of content parts", () => {
    expect(readModelText("Hello")).toBe("Hello");
    expect(readModelText([{ type: "text", text: "Hello there" }])).toBe("Hello there");
    expect(readModelText(null)).toBe("");
  });

  it("uses the next model when the first reply is empty", async () => {
    const calls: string[] = [];
    const answer = await createAssistantReply(["gpt-5.4-mini", "gpt-4o-mini"], async (model) => {
      calls.push(model);
      if (model === "gpt-5.4-mini") return "";
      return [{ type: "text", text: "I can help with that." }];
    });
    expect(calls).toEqual(["gpt-5.4-mini", "gpt-4o-mini"]);
    expect(answer).toBe("I can help with that.");
  });
});
