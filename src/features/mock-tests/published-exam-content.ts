// Turns a published builder test into the same section objects Mock Test 1
// plays. The file supplies the passage, the clip, the picture and the
// questions. The instruction lines, the clocks and the five videos come
// from the app, so every uploaded test opens like the built-in one.
//
// Answer keys are optional on purpose. The page that renders the exam
// builds the content without them and then strips whatever remains. The
// mark action builds a second copy with the keys and never sends that
// copy to the browser.
//
// House style: normal hyphens only, straight quotes only.

import { SECTION_TYPE_LABELS, type SectionType } from "@/features/admin/mock-test-types";
import { getInstructionalVideoAsset } from "@/features/exam-engine/instructional-video-assets";
import type { ListeningSectionContent } from "@/features/exam-engine/listening-section-types";
import type { ReadingSectionContent } from "@/features/exam-engine/reading-section-types";
import type { SpeakingSectionContent } from "@/features/exam-engine/speaking-mock-types";
import type { WritingSectionContent } from "@/features/exam-engine/writing-mock-types";
import type { MockTestPlayerContext } from "@/features/mock-tests/mock-test-flow";
import {
  learnerMockPath,
  type LearnerMockPart,
  type LearnerMockTest,
} from "@/features/mock-tests/published-mock-catalog";
import {
  PART_EXAM_TEMPLATES,
  SECTION_EXAM_LINES,
  partExamTemplate,
} from "@/features/mock-tests/part-exam-templates";

export type PublishedAnswerKey = {
  questionId: string;
  correctOptionId: string | null;
  explanation?: string;
};

// The file does not carry pixel sizes. These reserve a box so the column
// beside the picture does not jump as badly while the file loads.
const IMAGE_WIDTH = 1600;
const IMAGE_HEIGHT = 900;

export function buildPublishedListeningContent(
  test: LearnerMockTest,
  keys: PublishedAnswerKey[] = [],
): ListeningSectionContent | null {
  const section = findSection(test, "listening");

  if (!section) {
    return null;
  }

  const video = getInstructionalVideoAsset("listening");
  const keyMap = indexKeys(keys);

  return {
    testId: test.slug,
    sectionId: section.id,
    title: `${test.title} - Listening`,
    instructionScreen: {
      title: `${test.title} - Listening`,
      heading: "Listening test instructions",
      instructions: SECTION_EXAM_LINES.listening,
      noticeText: "Answers stay on this screen. Nothing is saved.",
      introTitle: test.title,
      introSummary: "Listening",
      introDetails: [
        { label: "Parts", value: String(section.parts.length) },
      ],
    },
    videoScreen: {
      title: `${test.title} - Listening Instructional Video`,
      video,
      description: video.description,
    },
    parts: section.parts.flatMap((part, index) => {
      if (!part.partType || !part.partType.startsWith("listening_")) {
        return [];
      }

      const template = partExamTemplate(part.partType);
      const audio = mediaOf(part, "audio");
      const questions = part.questions.map((question) => ({
        id: question.id,
        number: question.number,
        prompt: question.prompt ?? undefined,
        options: question.options.map((option) => ({
          id: option.id,
          text: `${option.label}. ${option.text}`,
        })),
      }));

      return [
        {
          kind: "sections" as const,
          partNumber: index + 1,
          partLabel: `Listening Part ${index + 1}`,
          formatLabel: template.formatLabel,
          content: {
            testId: test.slug,
            sectionId: part.id,
            title: `${test.title} - Listening Part ${index + 1}: ${part.title}`,
            partTitle: part.title,
            instructions: template.instructions,
            scenario: {
              text: passageText(part),
            },
            sections: [
              {
                id: `${part.id}-clip`,
                conversationAudioUrl: audio?.url ?? "",
                questions,
              },
            ],
            answerKey: questions.map((question) => {
              const key = keyMap.get(question.id);

              return {
                questionId: question.id,
                correctOptionId: key?.correctOptionId ?? null,
                explanation: key?.explanation,
                source: "manual" as const,
              };
            }),
          },
        },
      ];
    }),
  };
}

export function buildPublishedReadingContent(
  test: LearnerMockTest,
  keys: PublishedAnswerKey[] = [],
): ReadingSectionContent | null {
  const section = findSection(test, "reading");

  if (!section) {
    return null;
  }

  const video = getInstructionalVideoAsset("reading");
  const keyMap = indexKeys(keys);

  return {
    testId: test.slug,
    sectionId: section.id,
    title: `${test.title} - Reading`,
    instructionScreen: {
      title: `${test.title} - Reading`,
      instructions: SECTION_EXAM_LINES.reading,
      noticeText: "Answers stay on this screen. Nothing is saved.",
      introTitle: test.title,
      introSummary: "Reading",
    },
    videoScreen: {
      title: `${test.title} - Reading Instructional Video`,
      video,
      description: video.description,
    },
    parts: section.parts.flatMap((part, index) => {
      const template =
        part.partType && part.partType in PART_EXAM_TEMPLATES
          ? PART_EXAM_TEMPLATES[part.partType]
          : null;

      if (!template?.readingTaskScreen) {
        return [];
      }

      const image = mediaOf(part, "image");
      const passage = passageText(part);
      const questions = part.questions.map((question) => ({
        id: question.id,
        number: question.number,
        text: question.prompt ?? "",
        options: question.options.map((option) => ({
          id: option.id,
          text: `${option.label}. ${option.text}`,
        })),
      }));

      return [
        {
          partNumber: index + 1,
          partLabel: `Reading Part ${index + 1}`,
          formatLabel: template.formatLabel,
          taskScreen: template.readingTaskScreen,
          content: {
            testId: test.slug,
            sectionId: part.id,
            title: `${test.title} - Reading Part ${index + 1}: ${part.title}`,
            partTitle: part.title,
            instructions: template.instructions,
            passageInstruction: template.passageInstruction,
            passage: {
              label: template.passageLabel,
              paragraphs:
                template.readingTaskScreen === "information"
                  ? []
                  : paragraphsOf(passage),
              sections:
                template.readingTaskScreen === "information"
                  ? labelledSections(passage)
                  : undefined,
              image:
                image && template.readingTaskScreen === "diagram"
                  ? {
                      url: image.url,
                      alt: image.altText?.trim() || part.title,
                      width: IMAGE_WIDTH,
                      height: IMAGE_HEIGHT,
                    }
                  : undefined,
            },
            questionGroups: [
              {
                id: `${part.id}-questions`,
                label: `Questions 1 to ${Math.max(questions.length, 1)}`,
                instruction: "Choose the best answer.",
                questions,
              },
            ],
            timer: placeholderTimer(template.readingSeconds),
            answerKey: questions.map((question) => {
              const key = keyMap.get(question.id);

              return {
                questionId: question.id,
                correctOptionId: key?.correctOptionId ?? null,
                explanation: key?.explanation,
                source: "manual" as const,
              };
            }),
          },
        },
      ];
    }),
  };
}

export function buildPublishedWritingContent(
  test: LearnerMockTest,
): WritingSectionContent | null {
  const section = findSection(test, "writing");

  if (!section) {
    return null;
  }

  const video = getInstructionalVideoAsset("writing");

  return {
    testId: test.slug,
    sectionId: section.id,
    title: `${test.title} - Writing`,
    instructionScreen: {
      title: `${test.title} - Writing`,
      instructions: SECTION_EXAM_LINES.writing,
      noticeText: "Scores are practice estimates, not official CELPIP scores.",
      introTitle: test.title,
      introSummary: "Writing",
    },
    videoScreen: {
      title: `${test.title} - Writing Instructional Video`,
      video,
      description: video.description,
    },
    tasks: section.parts.flatMap((part, index) => {
      const template =
        part.partType && part.partType in PART_EXAM_TEMPLATES
          ? PART_EXAM_TEMPLATES[part.partType]
          : null;

      if (!template || template.writingSeconds <= 0) {
        return [];
      }

      const image = mediaOf(part, "image");

      return [
        {
          taskId: part.id,
          taskNumber: index + 1,
          taskLabel: `Writing Task ${index + 1}`,
          title: `${test.title} - Writing Task ${index + 1}: ${part.title}`,
          taskTitle: part.title,
          situationInstruction: template.situationInstruction,
          situationParagraphs: paragraphsOf(part.instructions?.trim() || part.title),
          promptInstruction: template.promptInstruction,
          promptRequirements: image
            ? ["Use the picture with this task. The instruction is the same on every practice test."]
            : [],
          wordTarget: { min: template.wordMin, max: template.wordMax },
          timer: placeholderTimer(template.writingSeconds),
          promptImage: image
            ? {
                url: image.url,
                alt: image.altText?.trim() || part.title,
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
              }
            : undefined,
        },
      ];
    }),
  };
}

export function buildPublishedSpeakingContent(
  test: LearnerMockTest,
): SpeakingSectionContent | null {
  const section = findSection(test, "speaking");

  if (!section) {
    return null;
  }

  const video = getInstructionalVideoAsset("speaking");

  return {
    testId: test.slug,
    sectionId: section.id,
    title: `${test.title} - Speaking`,
    instructionScreen: {
      title: `${test.title} - Speaking`,
      instructions: SECTION_EXAM_LINES.speaking,
      noticeText: "Scores are practice estimates, not official CELPIP scores.",
      introTitle: test.title,
      introSummary: "Speaking",
    },
    videoScreen: {
      title: `${test.title} - Speaking Instructional Video`,
      video,
      description: video.description,
    },
    tasks: section.parts.flatMap((part, index) => {
      const template =
        part.partType && part.partType in PART_EXAM_TEMPLATES
          ? PART_EXAM_TEMPLATES[part.partType]
          : null;

      if (!template || template.prepSeconds <= 0) {
        return [];
      }

      const image = mediaOf(part, "image");
      const prep = part.prepTimeSeconds ?? template.prepSeconds;
      const response = part.responseTimeSeconds ?? template.responseSeconds;

      return [
        {
          taskId: part.id,
          taskNumber: index + 1,
          taskLabel: `Speaking Task ${index + 1}`,
          title: `${test.title} - Speaking Task ${index + 1}: ${part.title}`,
          taskTitle: part.title,
          situationParagraphs: paragraphsOf(part.instructions?.trim() || part.title),
          promptInstruction: template.speakingPrompt,
          visuals: image
            ? [
                {
                  kind: "scene" as const,
                  id: `${part.id}-scene`,
                  image: {
                    url: image.url,
                    alt: image.altText?.trim() || part.title,
                    width: IMAGE_WIDTH,
                    height: IMAGE_HEIGHT,
                  },
                },
              ]
            : [],
          prepTimer: speakingTimer(prep, "Preparation window for an uploaded speaking task."),
          responseTimer: speakingTimer(response, "Recording window for an uploaded speaking task."),
        },
      ];
    }),
  };
}

export function buildPublishedPlayerContext(input: {
  slug: string;
  section: SectionType;
  mode: "section" | "full";
  present: SectionType[];
}): MockTestPlayerContext {
  const ordered = [...input.present].sort(
    (left, right) => sectionOrder(left) - sectionOrder(right),
  );
  const index = ordered.indexOf(input.section);
  const next =
    input.mode === "full" && index >= 0 ? ordered[index + 1] : undefined;
  const hubPath = `/dashboard/mock-tests/${input.slug}`;

  return {
    flow: input.mode,
    hubPath,
    exitHref: hubPath,
    section: input.section,
    nextSection: next
      ? {
          slug: next,
          href: learnerMockPath(input.slug, { section: next, flow: "full" }),
          label: SECTION_TYPE_LABELS[next],
        }
      : undefined,
    isLastSectionInFullMock: input.mode === "full" && !next,
  };
}

export function questionIdsInSection(
  test: LearnerMockTest,
  skill: SectionType,
): string[] {
  const section = findSection(test, skill);

  if (!section) {
    return [];
  }

  return section.parts.flatMap((part) =>
    part.questions.map((question) => question.id),
  );
}

function findSection(test: LearnerMockTest, skill: SectionType) {
  return (
    [...test.sections]
      .filter((section) => section.sectionType === skill)
      .sort((left, right) => left.order - right.order)[0] ?? null
  );
}

function indexKeys(keys: PublishedAnswerKey[]) {
  return new Map(keys.map((key) => [key.questionId, key]));
}

function mediaOf(part: LearnerMockPart, type: "audio" | "image") {
  return part.media.find((item) => item.mediaType === type) ?? null;
}

function passageText(part: LearnerMockPart): string {
  const fromQuestion = part.questions.find((question) => question.passageText?.trim())
    ?.passageText?.trim();

  return fromQuestion || part.instructions?.trim() || part.title;
}

function paragraphsOf(text: string): string[] {
  const chunks = text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  return chunks.length > 0 ? chunks : [text.trim() || " "];
}

function labelledSections(text: string) {
  return paragraphsOf(text).map((chunk, index) => {
    const labelled = /^([A-Z])[.):]\s+([\s\S]+)$/.exec(chunk);

    if (labelled) {
      return { label: labelled[1], paragraphs: [labelled[2].trim()] };
    }

    const letter = index < 26 ? String.fromCharCode(65 + index) : String(index + 1);

    return { label: letter, paragraphs: [chunk] };
  });
}

function placeholderTimer(seconds: number) {
  return {
    seconds,
    warningAtSeconds: 60,
    urgentAtSeconds: 20,
    source: "placeholder" as const,
    note: "Working clock for an uploaded practice test. The file does not carry a time.",
  };
}

function speakingTimer(seconds: number, note: string) {
  return {
    seconds,
    warningAtSeconds: Math.min(10, Math.max(1, Math.floor(seconds / 3))),
    urgentAtSeconds: Math.min(5, Math.max(1, Math.floor(seconds / 6))),
    source: "placeholder" as const,
    note,
  };
}

function sectionOrder(skill: SectionType): number {
  if (skill === "listening") return 1;
  if (skill === "reading") return 2;
  if (skill === "writing") return 3;
  return 4;
}
