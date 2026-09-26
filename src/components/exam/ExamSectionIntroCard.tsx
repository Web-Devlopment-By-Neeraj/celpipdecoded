import type { ReactNode } from "react";
import { cx } from "@/features/design/design-tokens";
import { examIntroCard } from "@/features/exam-engine/exam-theme";
import type { ExamSectionIntroDetail } from "@/features/exam-engine/instruction-screen-types";

// Section intro block for the top of an instruction screen (EXAM-02).
//
// It answers one question before the instructions start: which part of
// the practice test is this. Optional detail pairs carry the few facts a
// learner needs up front, for example the number of parts or the time
// allowed.
//
// Deliberately not a dashboard card. No shadow, no artwork, no pill, no
// badge. It is a quiet bordered strip inside the exam canvas, because the
// exam surface is a practice test environment and not a marketing page.

export type ExamSectionIntroCardProps = {
  // Small uppercase line above the title, for example "Listening".
  label?: string;
  title: string;
  summary?: string;
  details?: ExamSectionIntroDetail[];
  children?: ReactNode;
  className?: string;
};

export function ExamSectionIntroCard({
  label,
  title,
  summary,
  details,
  children,
  className,
}: ExamSectionIntroCardProps) {
  return (
    <div className={cx(examIntroCard.card, className)}>
      {label ? <p className={examIntroCard.label}>{label}</p> : null}
      <p className={examIntroCard.title}>{title}</p>
      {summary ? <p className={examIntroCard.summary}>{summary}</p> : null}

      {details && details.length > 0 ? (
        <dl className={examIntroCard.detailList}>
          {details.map((detail) => (
            <div key={detail.label} className={examIntroCard.detailItem}>
              <dt className={examIntroCard.detailLabel}>{detail.label}</dt>
              <dd className={examIntroCard.detailValue}>{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children}
    </div>
  );
}
