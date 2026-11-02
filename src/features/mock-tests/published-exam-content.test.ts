import { describe, expect, it } from "vitest";
import { withoutListeningSectionAnswerKeys } from "@/features/exam-engine/listening-section-flow";
import type { LearnerMockTest } from "./published-mock-catalog";
import {
  buildPublishedListeningContent,
  buildPublishedPlayerContext,
  buildPublishedWritingContent,
} from "./published-exam-content";

const test: LearnerMockTest = {
  id: "test-1",
  slug: "mock-test-2",
  title: "Mock Test 2",
  description: null,
  sections: [
    {
      id: "listening-section",
      sectionType: "listening",
      title: "Listening",
      instructions: null,
      order: 1,
      parts: [
        {
          id: "listening-part",
          title: "Train chat",
          partType: "listening_daily_conversation",
          instructions: "Anna asks Ben which train to take.",
          order: 1,
          prepTimeSeconds: null,
          responseTimeSeconds: null,
          media: [
            {
              id: "audio-1",
              mediaType: "audio",
              url: "https://example.com/train.mp3",
              title: "Train chat",
              altText: null,
            },
          ],
          questions: [
            {
              id: "question-1",
              number: 1,
              type: "single_choice",
              prompt: "Which train do they choose?",
              instruction: null,
              passageText: "Anna: Which train should we take?\n\nBen: The later one.",
              stem: null,
              helperText: null,
              points: 1,
              options: [
                { id: "option-a", label: "A", text: "The early train" },
                { id: "option-b", label: "B", text: "The later train" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "writing-section",
      sectionType: "writing",
      title: "Writing",
      instructions: null,
      order: 3,
      parts: [
        {
          id: "writing-part",
          title: "Missed meeting",
          partType: "writing_email",
          instructions: "You missed a meeting. Write to your manager.",
          order: 1,
          prepTimeSeconds: null,
          responseTimeSeconds: null,
          media: [
            {
              id: "image-1",
              mediaType: "image",
              url: "https://example.com/note.png",
              title: "Note",
              altText: "A note that says the meeting moved to 3 pm.",
            },
          ],
          questions: [],
        },
      ],
    },
  ],
};

describe("published exam content", () => {
  it("plays uploaded listening through the audio exam and keeps the key off the stripped copy", () => {
    const content = buildPublishedListeningContent(test, [
      {
        questionId: "question-1",
        correctOptionId: "option-b",
        explanation: "Ben wants time to buy tickets.",
      },
    ]);

    expect(content?.videoScreen.video.title).toBe("Listening instructional video");
    expect(content?.parts[0]?.kind).toBe("sections");

    if (content?.parts[0]?.kind !== "sections") {
      throw new Error("expected a conversation part");
    }

    expect(content.parts[0].content.sections[0]?.conversationAudioUrl).toBe(
      "https://example.com/train.mp3",
    );
    expect(content.parts[0].content.scenario.text).toContain("The later one");
    expect(content.parts[0].content.answerKey?.[0]?.correctOptionId).toBe(
      "option-b",
    );
    expect(content.parts[0].content.instructions[0]).toBe(
      "Listen to the conversation.",
    );

    const stripped = withoutListeningSectionAnswerKeys(content);
    const strippedPart = stripped.parts[0];

    if (strippedPart?.kind !== "sections") {
      throw new Error("expected a conversation part");
    }

    expect(strippedPart.content.answerKey).toBeUndefined();
    expect(strippedPart.content.sections[0]?.questions[0]?.correctOptionId).toBeUndefined();
  });

  it("uses the shared writing instruction and the uploaded picture", () => {
    const content = buildPublishedWritingContent(test);

    expect(content?.videoScreen?.video.title).toBe("Writing instructional video");
    expect(content?.tasks[0]?.promptInstruction).toBe(
      "Write an email about the situation. Use the picture if one is shown.",
    );
    expect(content?.tasks[0]?.promptImage?.url).toBe("https://example.com/note.png");
    expect(content?.tasks[0]?.situationParagraphs[0]).toContain("missed a meeting");
  });

  it("sends a full mock on to the next section of the same test", () => {
    const context = buildPublishedPlayerContext({
      slug: "mock-test-2",
      section: "listening",
      mode: "full",
      present: ["listening", "writing"],
    });

    expect(context.nextSection?.href).toBe(
      "/dashboard/mock-tests/mock-test-2?flow=full&section=writing",
    );
    expect(context.exitHref).toBe("/dashboard/mock-tests/mock-test-2");
    expect(context.isLastSectionInFullMock).toBe(false);
  });
});
