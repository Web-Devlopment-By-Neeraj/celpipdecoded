import { cx } from "@/features/design/design-tokens";
import {
  SKILLS,
  SKILL_LABELS,
  scoreBand,
  type ScoreBand,
  type Skill,
  type SkillScores,
} from "@/features/testimonials/testimonials";

// A CLB score drawn as a ring (DESIGN.md, score rings).
//
// The ring fills out of 12 and takes the score band colour: emerald for
// 9 and up, amber for 7 and 8, red below 7. The number in the middle is
// the actual content, so the ring is decoration and the whole thing reads
// as "Listening 11" to a screen reader.
//
// "onDark" is for the navy panel, where the empty track and the labels
// need light values.

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const bandStroke: Record<ScoreBand, string> = {
  high: "stroke-score-high",
  mid: "stroke-score-mid",
  low: "stroke-score-low",
};

const sizes = {
  sm: { box: "h-10 w-10", number: "text-sm" },
  md: { box: "h-12 w-12", number: "text-base" },
  lg: { box: "h-14 w-14 sm:h-16 sm:w-16", number: "text-lg sm:text-xl" },
} as const;

export type ScoreRingSize = keyof typeof sizes;
export type ScoreRingTone = "onLight" | "onDark";

export function ScoreRing({
  skill,
  score,
  size = "md",
  tone = "onLight",
  muted = false,
}: {
  skill: Skill;
  score: number;
  size?: ScoreRingSize;
  tone?: ScoreRingTone;
  // An earlier result, drawn quieter than the current one.
  muted?: boolean;
}) {
  const label = SKILL_LABELS[skill];
  const progress = Math.max(0, Math.min(score, 12)) / 12;

  return (
    <div
      role="img"
      aria-label={`${label} ${score}`}
      className="flex flex-col items-center gap-1.5"
    >
      <span aria-hidden className={cx("relative", sizes[size].box)}>
        <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            className={tone === "onDark" ? "stroke-white/12" : "stroke-ink/10"}
          />
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className={cx(bandStroke[scoreBand(score)], muted && "opacity-45")}
          />
        </svg>
        <span
          className={cx(
            "absolute inset-0 flex items-center justify-center font-bold tabular-nums",
            sizes[size].number,
            tone === "onDark"
              ? muted
                ? "text-white/60"
                : "text-white"
              : muted
                ? "text-ink/55"
                : "text-ink",
          )}
        >
          {score}
        </span>
      </span>
      <span
        aria-hidden
        className={cx(
          "text-[0.625rem] font-semibold uppercase tracking-[0.12em]",
          tone === "onDark" ? "text-white/55" : "text-ink/55",
        )}
      >
        {size === "sm" ? label.charAt(0) : label}
      </span>
    </div>
  );
}

// The four skills in CELPIP order.
export function ScoreRow({
  scores,
  size = "md",
  tone = "onLight",
  muted = false,
  className,
}: {
  scores: SkillScores;
  size?: ScoreRingSize;
  tone?: ScoreRingTone;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("grid grid-cols-4 gap-2", className)}>
      {SKILLS.map((skill) => (
        <ScoreRing
          key={skill}
          skill={skill}
          score={scores[skill]}
          size={size}
          tone={tone}
          muted={muted}
        />
      ))}
    </div>
  );
}
