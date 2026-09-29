export const DIAGNOSTIC_MODULES = [
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
] as const;

export type DiagnosticModule = (typeof DIAGNOSTIC_MODULES)[number];

export type DiagnosticScores = Record<DiagnosticModule, number | null>;

export type DiagnosticFieldError = {
  field: DiagnosticModule;
  message: string;
};

export type DiagnosticVerdict = {
  weakModules: DiagnosticModule[];
  allEqual: boolean;
  tie: boolean;
  headline: string;
  explanation: string;
};

const EXPLANATIONS: Record<DiagnosticModule, string> = {
  Listening:
    "The scores you entered are lowest in Listening. Start with course Section 1 for Listening, then sit the free mock.",
  Reading:
    "The scores you entered are lowest in Reading. Start with course Section 1 for Reading, then sit the free mock.",
  Writing:
    "The scores you entered are lowest in Writing. Start with the answer-shape mini-course, then practise one writing task.",
  Speaking:
    "The scores you entered are lowest in Speaking. Start with the three-part shape mini-course, then record Speaking Task 1.",
};

export function validateDiagnosticScores(
  scores: DiagnosticScores,
): DiagnosticFieldError[] {
  const errors: DiagnosticFieldError[] = [];

  for (const field of DIAGNOSTIC_MODULES) {
    const value = scores[field];
    if (value === null || Number.isNaN(value)) {
      errors.push({ field, message: `${field} is required.` });
      continue;
    }
    if (!Number.isInteger(value) || value < 4 || value > 12) {
      errors.push({
        field,
        message: `${field} must be a whole number from 4 to 12.`,
      });
    }
  }

  return errors;
}

function productiveRank(module: DiagnosticModule): number {
  if (module === "Speaking") return 0;
  if (module === "Writing") return 1;
  if (module === "Listening") return 2;
  return 3;
}

function joinModules(modules: DiagnosticModule[]): string {
  if (modules.length === 1) return modules[0];
  if (modules.length === 2) return `${modules[0]} and ${modules[1]}`;
  return `${modules.slice(0, -1).join(", ")} and ${modules[modules.length - 1]}`;
}

export function diagnoseScores(scores: DiagnosticScores): DiagnosticVerdict | null {
  if (validateDiagnosticScores(scores).length > 0) return null;

  const ranked = DIAGNOSTIC_MODULES.map((module) => ({
    module,
    score: scores[module] as number,
  }));
  const lowest = Math.min(...ranked.map((item) => item.score));
  const weak = ranked
    .filter((item) => item.score === lowest)
    .map((item) => item.module)
    .sort((a, b) => productiveRank(a) - productiveRank(b));

  if (weak.length === DIAGNOSTIC_MODULES.length) {
    return {
      weakModules: [],
      allEqual: true,
      tie: false,
      headline: "All four scores you entered are the same.",
      explanation:
        "Sit the free mock test to find which section is actually the weakest.",
    };
  }

  if (weak.length > 1) {
    return {
      weakModules: weak,
      allEqual: false,
      tie: true,
      headline: `${joinModules(weak)} are tied as your weakest.`,
      explanation:
        "Start with speaking, then writing. Those answers can be coached one recording or one draft at a time.",
    };
  }

  const only = weak[0];
  return {
    weakModules: [only],
    allEqual: false,
    tie: false,
    headline: `${only} is the module costing you the most points.`,
    explanation: EXPLANATIONS[only],
  };
}
