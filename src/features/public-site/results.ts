export type Skill = "Listening" | "Reading" | "Writing" | "Speaking";

export type Testimonial = {
  id: string;
  firstName: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  before: Record<Skill, number> | null;
  quote: string;
  proofType: string;
  firstAttempt: boolean;
  consentReceivedAt: string | null;
  published: boolean;
  coveredProof: boolean;
  testDate: string;
};

export type ResultStats = {
  verifiedShown: number;
  clb9AllFour: number;
  perfect12s: number;
  biggestJump: { skill: Skill; gain: number } | null;
};

const SKILLS: Skill[] = ["Listening", "Reading", "Writing", "Speaking"];

export function skillValue(item: Testimonial, skill: Skill): number {
  if (skill === "Listening") return item.listening;
  if (skill === "Reading") return item.reading;
  if (skill === "Writing") return item.writing;
  return item.speaking;
}

export function publicTestimonials(items: Testimonial[]): Testimonial[] {
  return items
    .filter((item) => item.published && item.consentReceivedAt)
    .sort((a, b) => (a.testDate < b.testDate ? 1 : -1));
}

export function computeResultStats(
  items: Testimonial[],
  bigJumpThreshold = 2,
): ResultStats {
  const visible = publicTestimonials(items);
  let perfect12s = 0;
  let clb9AllFour = 0;
  let biggest: { skill: Skill; gain: number } | null = null;

  for (const item of visible) {
    const scores = SKILLS.map((skill) => skillValue(item, skill));
    if (scores.every((score) => score >= 9)) clb9AllFour += 1;
    if (scores.some((score) => score === 12)) perfect12s += 1;
    if (!item.before) continue;
    for (const skill of SKILLS) {
      const gain = skillValue(item, skill) - item.before[skill];
      if (!biggest || gain > biggest.gain) biggest = { skill, gain };
    }
  }

  return {
    verifiedShown: visible.length,
    clb9AllFour,
    perfect12s,
    biggestJump: biggest && biggest.gain >= bigJumpThreshold ? biggest : biggest,
  };
}

export type ResultFilter = "all" | "clb9" | "jump" | "first";

export function filterTestimonials(
  items: Testimonial[],
  filter: ResultFilter,
  bigJumpThreshold = 2,
): Testimonial[] {
  const visible = publicTestimonials(items);
  if (filter === "all") return visible;
  if (filter === "clb9") {
    return visible.filter((item) =>
      SKILLS.every((skill) => skillValue(item, skill) >= 9),
    );
  }
  if (filter === "first") return visible.filter((item) => item.firstAttempt);
  return visible.filter((item) => {
    if (!item.before) return false;
    return SKILLS.some(
      (skill) => skillValue(item, skill) - item.before![skill] >= bigJumpThreshold,
    );
  });
}

export function scoreRingColor(score: number): "green" | "amber" | "red" {
  if (score >= 9) return "green";
  if (score >= 7) return "amber";
  return "red";
}

export function scoreRingFill(score: number): number {
  return Math.max(0, Math.min(1, score / 12));
}

export function skillGain(after: number, before: number): string {
  const gain = after - before;
  if (gain > 0) return `+${gain}`;
  return String(gain);
}
