import { AppButtonLink } from "@/components/app/AppButtonLink";
import { AppCard } from "@/components/app/AppCard";
import { cx, text } from "@/features/design/design-tokens";
import type {
  EvaluationSnapshot,
  NextStepCard,
  TestCountdown,
} from "@/features/dashboard/dashboard-home";

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <AppCard as="section" ariaLabel={label} padding="compact">
      <p className={cx("text-xs font-semibold uppercase tracking-[0.15em]", text.muted)}>
        {label}
      </p>
      <p className={cx("mt-2 font-serif text-2xl font-bold", text.heading)}>{value}</p>
      <p className={cx("mt-2 text-sm leading-6", text.secondary)}>{detail}</p>
    </AppCard>
  );
}

export function DashboardStudySnapshot({
  countdown,
  targetClb,
  evaluations,
  nextStep,
}: {
  countdown: TestCountdown;
  targetClb: string;
  evaluations: EvaluationSnapshot;
  nextStep: NextStepCard;
}) {
  const evaluationValue =
    evaluations.kind === "sprint"
      ? `${evaluations.leftToday} today`
      : `${evaluations.speakingLeft + evaluations.writingLeft} free`;
  const evaluationDetail =
    evaluations.kind === "sprint"
      ? `${evaluations.leftThisMonth} left this month${
          evaluations.monthLimit ? ` of ${evaluations.monthLimit}` : ""
        }. ${evaluations.usedToday} used today. The monthly balance is what blocks a new report. A separate daily block is not on yet.`
      : `${evaluations.speakingLeft} speaking and ${evaluations.writingLeft} writing free reports left. Today and this month appear with Test Sprint.`;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Days until your test"
        value={countdown.headline}
        detail={countdown.detail}
      />
      <Stat label="Target CLB" value={targetClb} detail="The score you chose at sign-up." />
      <Stat
        label="AI evaluations left"
        value={evaluationValue}
        detail={evaluationDetail}
      />
      <AppCard as="section" ariaLabel="Do this next" variant="highlighted" padding="compact">
        <p className={cx("text-xs font-semibold uppercase tracking-[0.15em]", text.muted)}>
          Do this next
        </p>
        <p className={cx("mt-3 text-sm leading-6", text.secondary)}>{nextStep.message}</p>
        <div className="mt-4">
          <AppButtonLink href={nextStep.href}>{nextStep.cta}</AppButtonLink>
        </div>
      </AppCard>
    </div>
  );
}
