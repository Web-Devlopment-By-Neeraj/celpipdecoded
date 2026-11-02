// Student results shown on the home page and on /results.
//
// The quotes and scores come from the client Build Pack (results wall
// mockup). Before this goes to production every student needs to have
// given written consent for website use, and the pack flags Nikhil's and
// Gurnoor's scores for a correction from the client. Both are tracked in
// docs/qa/manual-tracker.md.
//
// The stats under the headline are computed from this list rather than
// typed in, so adding or removing a result can never leave a number on
// the page that the cards do not back up.

export const SKILLS = ["listening", "reading", "writing", "speaking"] as const;
export type Skill = (typeof SKILLS)[number];
export type SkillScores = Record<Skill, number>;

export const SKILL_LABELS: Record<Skill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export type ProofKind =
  | "official-report"
  | "score-message"
  | "video"
  | "whatsapp"
  | "instagram"
  | "before-after";

export const PROOF_LABELS: Record<ProofKind, string> = {
  "official-report": "Official score report",
  "score-message": "Score message",
  video: "Video testimonial",
  whatsapp: "WhatsApp message",
  instagram: "Instagram DM",
  "before-after": "Before and after",
};

export type SkillJump = { skill: Skill; from: number; to: number };

export type Testimonial = {
  id: string;
  name: string;
  scores: SkillScores;
  quote: string;
  proof: ProofKind;
  firstAttempt?: boolean;
  // Short extra context the student gave, for example "3 days of prep".
  note?: string;
  // A full earlier result, when the student shared one.
  before?: SkillScores;
  // A single skill the student told us about, when there is no full
  // earlier result.
  jump?: SkillJump;
};

function s(
  listening: number,
  reading: number,
  writing: number,
  speaking: number,
): SkillScores {
  return { listening, reading, writing, speaking };
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "smriti",
    name: "Smriti",
    scores: s(8, 8, 10, 8),
    before: s(7, 6, 7, 7),
    proof: "before-after",
    quote:
      "Couldn't have done it without the teaching and feedback. The confidence it built was everything.",
  },
  {
    id: "tanushka",
    name: "Tanushka",
    scores: s(12, 9, 9, 11),
    before: s(10, 9, 8, 10),
    proof: "before-after",
    quote:
      "Kept working on the weak areas and it paid off. Amar's strategies work, just trust the process.",
  },
  {
    id: "beena",
    name: "Beena",
    scores: s(10, 9, 10, 10),
    jump: { skill: "reading", from: 6, to: 9 },
    proof: "whatsapp",
    quote:
      "The part where you said don't read the full passage first changed everything. I went from 6 to 9 in reading.",
  },
  {
    id: "dawinder",
    name: "Dawinder",
    scores: s(8, 10, 8, 11),
    jump: { skill: "reading", from: 6, to: 10 },
    proof: "score-message",
    quote: "I jumped in reading from 6 to 10. Thanks a lot.",
  },
  {
    id: "nikhil",
    name: "Nikhil",
    scores: s(11, 12, 10, 10),
    proof: "official-report",
    quote: "Your templates helped me out big time, especially in writing.",
  },
  {
    id: "gargi",
    name: "Gargi",
    scores: s(10, 11, 10, 12),
    proof: "score-message",
    quote:
      "Please continue providing your guidance and honest feedback. Helps a lot.",
  },
  {
    id: "aman",
    name: "Aman",
    scores: s(9, 9, 9, 11),
    proof: "video",
    quote:
      "Thanks to your notes, I was able to max my CELPIP score. Your templates were a huge help.",
  },
  {
    id: "humairaa",
    name: "Humairaa",
    scores: s(10, 10, 10, 11),
    proof: "score-message",
    quote: "I can't believe it. This is unbelievable!",
  },
  {
    id: "kishan",
    name: "Kishan",
    scores: s(8, 9, 8, 8),
    proof: "score-message",
    firstAttempt: true,
    note: "3 days of prep",
    quote: "Best morning text. 1st attempt and 3 days of preparation.",
  },
  {
    id: "gurnoor",
    name: "Gurnoor",
    scores: s(10, 8, 8, 10),
    proof: "whatsapp",
    firstAttempt: true,
    quote: "I didn't expect this score at all! It was my first attempt.",
  },
  {
    id: "davinder",
    name: "Davinder",
    scores: s(9, 9, 9, 10),
    proof: "official-report",
    quote: "It got possible because of your help. Really appreciate it!",
  },
  {
    id: "anu",
    name: "Anu",
    scores: s(12, 9, 9, 9),
    proof: "instagram",
    quote:
      "The reading strategy especially. Keep doing this work, it is needed!",
  },
  {
    id: "daisy",
    name: "Daisy",
    scores: s(9, 9, 9, 9),
    proof: "whatsapp",
    quote:
      "He breaks down complex sections into simple tips and templates. Best tutor to go to for Canada PR.",
  },
  {
    id: "manpreet",
    name: "Manpreet",
    scores: s(11, 7, 10, 11),
    proof: "score-message",
    quote:
      "Used your email template last week and finished with 5 minutes left. Never happened before.",
  },
  {
    id: "sukhdeep",
    name: "Sukhdeep",
    scores: s(10, 9, 9, 9),
    proof: "score-message",
    quote: "I got 9 in writing finally, by learning your strategies.",
  },
  {
    id: "vishal",
    name: "Vishal",
    scores: s(9, 9, 7, 7),
    proof: "official-report",
    firstAttempt: true,
    quote:
      "First attempt and got a 9 in both listening and reading. Writing and speaking next.",
  },
  {
    id: "ekamjeet",
    name: "Ekamjeet",
    scores: s(10, 9, 8, 8),
    proof: "score-message",
    quote:
      "Happy with listening and reading. Overall a good start. Thank you Amar!",
  },
  {
    id: "sumit",
    name: "Sumit",
    scores: s(8, 9, 8, 8),
    proof: "score-message",
    quote:
      "I was always weak in reading, so I focused on that. Got a 9 and so relieved.",
  },
];

// The stories with an earlier result, shown in the before and after
// spotlight in this order.
export const SPOTLIGHT_IDS = ["smriti", "tanushka", "beena", "dawinder"] as const;

// Client claim from the Build Pack, about the whole coaching history
// rather than the cards on this page.
export const RESULTS_HEADLINE = "100+ students coached to CLB 9+";

export type ScoreBand = "high" | "mid" | "low";

// The colour band for a CLB score: 9 and up is the goal for most PR
// applicants, 7 and 8 is close, below 7 needs work.
export function scoreBand(score: number): ScoreBand {
  if (score >= 9) return "high";
  if (score >= 7) return "mid";
  return "low";
}

export function isClb9AllFour(testimonial: Testimonial): boolean {
  return SKILLS.every((skill) => testimonial.scores[skill] >= 9);
}

export function hasPerfectTwelve(testimonial: Testimonial): boolean {
  return SKILLS.some((skill) => testimonial.scores[skill] === 12);
}

// Every improvement a testimonial can back up, biggest first. A full
// earlier result gives one entry per skill that went up.
export function jumpsFor(testimonial: Testimonial): SkillJump[] {
  const jumps: SkillJump[] = [];
  if (testimonial.before) {
    for (const skill of SKILLS) {
      const from = testimonial.before[skill];
      const to = testimonial.scores[skill];
      if (to > from) jumps.push({ skill, from, to });
    }
  }
  if (testimonial.jump) jumps.push(testimonial.jump);
  return jumps.sort((a, b) => b.to - b.from - (a.to - a.from));
}

export function biggestJump(
  testimonial: Testimonial,
): SkillJump | undefined {
  return jumpsFor(testimonial)[0];
}

export function hasBigJump(testimonial: Testimonial): boolean {
  const jump = biggestJump(testimonial);
  return jump !== undefined && jump.to - jump.from >= 2;
}

export type ResultsStats = {
  shown: number;
  clb9AllFour: number;
  perfectTwelve: number;
  biggest?: { name: string } & SkillJump;
};

export function resultsStats(list: readonly Testimonial[]): ResultsStats {
  let biggest: ResultsStats["biggest"];
  for (const testimonial of list) {
    const jump = biggestJump(testimonial);
    if (!jump) continue;
    if (!biggest || jump.to - jump.from > biggest.to - biggest.from) {
      biggest = { name: testimonial.name, ...jump };
    }
  }

  return {
    shown: list.length,
    clb9AllFour: list.filter(isClb9AllFour).length,
    perfectTwelve: list.filter(hasPerfectTwelve).length,
    biggest,
  };
}

export const RESULT_FILTERS = [
  { id: "all", label: "All results" },
  { id: "clb9", label: "CLB 9+ in all four" },
  { id: "jumps", label: "Big jumps" },
  { id: "first-attempt", label: "First attempt" },
] as const;

export type ResultFilter = (typeof RESULT_FILTERS)[number]["id"];

export function filterTestimonials(
  list: readonly Testimonial[],
  filter: ResultFilter,
): Testimonial[] {
  switch (filter) {
    case "clb9":
      return list.filter(isClb9AllFour);
    case "jumps":
      return list.filter(hasBigJump);
    case "first-attempt":
      return list.filter((testimonial) => testimonial.firstAttempt);
    default:
      return [...list];
  }
}

// One line under the name, for example "First attempt · 3 days of prep"
// or "Reading 6 → 10".
export function testimonialHighlight(
  testimonial: Testimonial,
): string | undefined {
  const parts: string[] = [];
  if (testimonial.firstAttempt) parts.push("First attempt");
  if (testimonial.note) parts.push(testimonial.note);
  const jump = biggestJump(testimonial);
  if (jump && jump.to - jump.from >= 2) {
    parts.push(`${SKILL_LABELS[jump.skill]} ${jump.from} → ${jump.to}`);
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function testimonialById(id: string): Testimonial | undefined {
  return TESTIMONIALS.find((testimonial) => testimonial.id === id);
}
