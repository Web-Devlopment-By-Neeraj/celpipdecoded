// Diagnose one weak skill, prescribe one mini-course, then show the
// before and after. Two patterns never become two cards.

export type CriterionName =
  | "content_coherence"
  | "vocabulary"
  | "readability"
  | "listenability"
  | "task_fulfilment";

export type EvaluationSnapshot = {
  id: string;
  module: "writing" | "speaking";
  criteria: Array<{ name: CriterionName; level: number }>;
};

export type QuestionResult = {
  skillTag: string;
  correct: boolean;
};

export type MiniCourse = {
  id: string;
  title: string;
  skillTags: string[];
};

export const MINI_COURSES: MiniCourse[] = [
  { id: "grammar-gym", title: "Grammar Gym", skillTags: ["readability"] },
  { id: "precision-bank", title: "Precision Bank", skillTags: ["vocabulary"] },
  { id: "idea-engine", title: "Idea Engine", skillTags: ["content_coherence"] },
  { id: "argument-lab", title: "Argument Lab", skillTags: ["content_coherence", "task_fulfilment"] },
  { id: "road-to-clb-9", title: "Road to CLB 9", skillTags: ["content_coherence", "vocabulary", "readability", "listenability", "task_fulfilment"] },
  { id: "inference-lab", title: "Inference lab", skillTags: ["inference"] },
];

export type Pattern = {
  skillTag: string;
  level: number;
  reason: string;
};

export type LoopSettings = {
  wsWindow: number;
  wsHits: number;
  rlAccuracyBelow: number;
  rlMinQuestions: number;
  targetLevel: number;
};

const CRITERION_ORDER: CriterionName[] = [
  "content_coherence",
  "vocabulary",
  "readability",
  "listenability",
  "task_fulfilment",
];

function lowestCriteria(evaluation: EvaluationSnapshot): CriterionName[] {
  const min = Math.min(...evaluation.criteria.map((item) => item.level));
  return evaluation.criteria.filter((item) => item.level === min).map((item) => item.name);
}

export function writingSpeakingPatterns(
  evaluations: EvaluationSnapshot[],
  module: "writing" | "speaking",
  settings: LoopSettings,
): Pattern[] {
  const recent = evaluations.filter((item) => item.module === module).slice(-settings.wsWindow);
  if (recent.length < settings.wsWindow) return [];
  const counts = new Map<CriterionName, number>();
  for (const evaluation of recent) {
    for (const name of lowestCriteria(evaluation)) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  const patterns: Pattern[] = [];
  for (const [name, hits] of counts) {
    if (hits < settings.wsHits) continue;
    const levels = recent.flatMap((evaluation) =>
      evaluation.criteria.filter((item) => item.name === name).map((item) => item.level),
    );
    const level = levels.reduce((sum, value) => sum + value, 0) / (levels.length || 1);
    patterns.push({
      skillTag: name,
      level,
      reason: `${label(name)} was your lowest criterion in ${hits} of your last ${settings.wsWindow} ${module} answers.`,
    });
  }
  return patterns;
}

export function readingListeningPatterns(
  results: QuestionResult[],
  settings: LoopSettings,
): Pattern[] {
  const groups = new Map<string, QuestionResult[]>();
  for (const result of results) {
    const list = groups.get(result.skillTag) ?? [];
    list.push(result);
    groups.set(result.skillTag, list);
  }
  const patterns: Pattern[] = [];
  for (const [tag, items] of groups) {
    if (items.length < settings.rlMinQuestions) continue;
    const correct = items.filter((item) => item.correct).length;
    const accuracy = (correct / items.length) * 100;
    if (accuracy >= settings.rlAccuracyBelow) continue;
    patterns.push({
      skillTag: tag,
      level: accuracy / 10,
      reason: `${tag} accuracy is ${Math.round(accuracy)} percent across ${items.length} questions.`,
    });
  }
  return patterns;
}

function label(name: string): string {
  return name.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function choosePattern(patterns: Pattern[], targetLevel: number): Pattern | null {
  if (patterns.length === 0) return null;
  return [...patterns].sort((a, b) => {
    const gap = targetLevel - b.level - (targetLevel - a.level);
    if (gap !== 0) return gap;
    return CRITERION_ORDER.indexOf(a.skillTag as CriterionName) -
      CRITERION_ORDER.indexOf(b.skillTag as CriterionName);
  })[0];
}

export function courseForSkill(skillTag: string, courses: MiniCourse[] = MINI_COURSES): MiniCourse | null {
  const matches = courses.filter((course) => course.skillTags.includes(skillTag));
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => a.skillTags.length - b.skillTags.length)[0];
}

export type Prescription = {
  id: string;
  userId: string;
  skillTag: string;
  miniCourseId: string;
  reason: string;
  levelBefore: number;
  levelAfter: number | null;
  completedAt: Date | null;
  active: boolean;
};

export function createPrescription(
  userId: string,
  pattern: Pattern,
  courses: MiniCourse[] = MINI_COURSES,
): { prescription: Prescription | null; gapLogged: boolean } {
  const course = courseForSkill(pattern.skillTag, courses);
  if (!course) return { prescription: null, gapLogged: true };
  return {
    gapLogged: false,
    prescription: {
      id: `rx_${userId}_${pattern.skillTag}`,
      userId,
      skillTag: pattern.skillTag,
      miniCourseId: course.id,
      reason: `${pattern.reason} This short lesson works on that skill.`,
      levelBefore: pattern.level,
      levelAfter: null,
      completedAt: null,
      active: true,
    },
  };
}

export function offerPrescription(
  existing: Prescription | null,
  next: Prescription | null,
): Prescription | null {
  if (existing?.active) return null;
  return next;
}

export function completePrescription(
  prescription: Prescription,
  miniCourseId: string,
  now: Date,
): Prescription {
  if (prescription.miniCourseId !== miniCourseId) return prescription;
  return { ...prescription, completedAt: now, active: false };
}

export type PracticeItem = { id: string; skillTag: string; seen: boolean };

export function repracticeSet(items: PracticeItem[], skillTag: string, size: number): PracticeItem[] {
  return items
    .filter((item) => item.skillTag === skillTag)
    .sort((a, b) => Number(a.seen) - Number(b.seen))
    .slice(0, size);
}

export function proveCopy(before: number, after: number): string {
  const change = Math.round((after - before) * 10) / 10;
  const direction = change > 0 ? `up ${change}` : change < 0 ? `down ${Math.abs(change)}` : "unchanged";
  return `Practice estimate. This skill moved from ${before} to ${after} (${direction}).`;
}
