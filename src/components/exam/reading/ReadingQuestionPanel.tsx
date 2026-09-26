"use client";

import { Fragment } from "react";
import { ReadingQuestionList } from "./ReadingQuestionList";
import { MockTestDropdownSelect } from "../player/MockTestDropdownSelect";
import { examReading } from "@/features/exam-engine/exam-theme";
import { readingCopy } from "@/features/exam-engine/reading-copy";
import type {
  ReadingAnswerMap,
  ReadingQuestion,
  ReadingQuestionGroup,
  ReadingResponseParagraph,
} from "@/features/exam-engine/reading-types";

// One panel on the answer side of a Reading split screen (EXAM-16).
//
// Screen type 8 calls these the right hand panels. Reading Part 1 has
// two, and so do Parts 2 and 4: a set of questions about the passage,
// then a written response with blanks in it. This component draws either,
// because the only difference between them is whether the group carries a
// response.
//
// EXAM-18 reuses it for Reading Part 2 unchanged in shape: the email with
// its five blanks is a completion group and the three questions after it
// are a plain group, which is exactly the pair this component already
// draws. The one addition is the email header, headerLines on the
// response, which Part 1's letter does not have.
//
// A panel is a label, an instruction line from the source document, the
// response if there is one, and the question list. It is not an ExamPanel:
// the answer column is already a tinted pane, and a bordered box drawn
// inside it would be a second border around the same content. The one
// bordered thing here is the reply itself, which is a document rather
// than a container.
//
// **The control sits in the reply** (EXAM-UI-05). A blank inside a
// written response is answered where the blank is, so question 7 is a
// compact drop-down standing in the sentence it completes rather than a
// control in a list under the letter with the sentence somewhere above
// it. That is what a fill in the blank question is, and it is what the
// reference exam layout does.
//
// It became possible when EXAM-UI-05 rebuilt the drop-down: the trigger
// is capped and truncates, so a long option cannot stretch the paragraph,
// and the menu floats in the viewport, so opening one adds no height to
// the reply and moves no text under it. The echo this component used to
// draw, where a chosen answer replaced the underscores in the sentence,
// is gone with the separate list: the trigger is the answer, in the
// place the echo used to appear.
//
// The list below the reply draws whatever the reply did not. A group
// whose every question is a blank in the response renders no list at all,
// and a group that mixes the two, which none of the shipped Reading parts
// does, would still draw the rest. Nothing is dropped and nothing is
// drawn twice.
//
// A client component, because the list under it is one. It holds no
// state: the answers are owned by the prototype at the top of the part.

export type ReadingQuestionPanelProps = {
  group: ReadingQuestionGroup;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
};

export function ReadingQuestionPanel({
  group,
  answers,
  onSelectOption,
}: ReadingQuestionPanelProps) {
  const responseQuestionIds = listResponseQuestionIds(group);
  const listQuestions = group.questions.filter(
    (question) => !responseQuestionIds.has(question.id),
  );

  return (
    <section className={examReading.panel} aria-label={group.label}>
      {group.label ? (
        <p className={examReading.panelLabel}>{group.label}</p>
      ) : null}

      {group.instruction ? (
        <p className={examReading.panelInstruction}>{group.instruction}</p>
      ) : null}

      {group.response ? (
        <div className={examReading.response}>
          {/* Email header lines, added by EXAM-18 for Reading Part 2.
              The subject and the two addresses print as plain text and
              never as mailto links: extracted-links.md records that they
              are passage text rather than real addresses. */}
          {group.response.headerLines ? (
            <div className={examReading.responseHeader}>
              {group.response.headerLines.map((line) => (
                <span key={line} className={examReading.responseHeaderLine}>
                  {line}
                </span>
              ))}
            </div>
          ) : null}

          {group.response.heading ? (
            <p className={examReading.passageHeading}>
              {group.response.heading}
            </p>
          ) : null}

          {group.response.paragraphs.map((paragraph, index) => (
            <p
              // Paragraphs have no ids of their own and never reorder, so
              // the index is the stable key here.
              key={`${group.id}-response-paragraph-${index}`}
              // Looser than a passage paragraph: this one carries inline
              // controls and the lines have to clear them (EXAM-UI-05).
              className={examReading.responseParagraph}
            >
              <ResponseParagraph
                paragraph={paragraph}
                group={group}
                answers={answers}
                onSelectOption={onSelectOption}
              />
            </p>
          ))}

          {group.response.signOff ? (
            <div className={examReading.passageSignOff}>
              {group.response.signOff.map((line) => (
                <span key={line} className={examReading.passageSignOffLine}>
                  {line}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {listQuestions.length > 0 ? (
        <ReadingQuestionList
          questions={listQuestions}
          answers={answers}
          onSelectOption={onSelectOption}
        />
      ) : null}
    </section>
  );
}

// The question ids the reply answers inside its own text.
function listResponseQuestionIds(group: ReadingQuestionGroup): Set<string> {
  const ids = new Set<string>();

  for (const paragraph of group.response?.paragraphs ?? []) {
    for (const segment of paragraph.segments) {
      if (segment.kind === "blank") {
        ids.add(segment.questionId);
      }
    }
  }

  return ids;
}

// One paragraph of a reply, with a drop-down standing in each blank.
//
// The paragraph arrives already split into text and blank segments, so
// there is nothing to parse here. A blank draws its number and then the
// control that answers it, which is the same shared control every other
// drop-down question in the player uses.
//
// A blank whose question is missing from the group falls back to drawn
// underscores rather than to nothing, so a content error shows up as a
// gap in a sentence instead of as a silently unanswerable question. No
// shipped content is in that state.
function ResponseParagraph({
  paragraph,
  group,
  answers,
  onSelectOption,
}: {
  paragraph: ReadingResponseParagraph;
  group: ReadingQuestionGroup;
  answers: ReadingAnswerMap;
  onSelectOption: (questionId: string, optionId: string) => void;
}) {
  return (
    <>
      {paragraph.segments.map((segment, index) => {
        const key = `${group.id}-segment-${index}`;

        if (segment.kind === "text") {
          return <Fragment key={key}>{segment.text}</Fragment>;
        }

        const question: ReadingQuestion | undefined = group.questions.find(
          (candidate) => candidate.id === segment.questionId,
        );

        return (
          <Fragment key={key}>
            <span className={examReading.responseBlankNumber}>
              {segment.number}.
            </span>{" "}
            {question ? (
              <MockTestDropdownSelect
                options={question.options}
                value={answers[question.id] ?? ""}
                onChange={(optionId) => onSelectOption(question.id, optionId)}
                placeholderLabel={readingCopy.dropdownPlaceholder}
                ariaLabel={`${readingCopy.questionNumberLabel} ${segment.number}`}
              />
            ) : (
              <span className={examReading.responseBlank}>
                <span aria-hidden="true">_______</span>
                <span className="sr-only">{readingCopy.blankLabel}</span>
              </span>
            )}
          </Fragment>
        );
      })}
    </>
  );
}
