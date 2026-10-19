import { describe, expect, it } from "vitest";
import {
  ASSISTANT_HISTORY_LIMIT,
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
});
