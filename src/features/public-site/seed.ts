import type { DrawRecord } from "./draws";
import type { Testimonial } from "./results";

export const IRCC_ROUNDS_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html";

// Public round figures reported for September 2026. The official IRCC
// page is linked on every view and is the authority if a figure differs.
export const SEED_DRAWS: DrawRecord[] = [
  draw("2026-09-28", "Provincial Nominee Program", 733, 725, "2026-09-17"),
  draw("2026-09-16", "Senior managers", 250, 389, "2026-09-01"),
  draw("2026-09-15", "Canadian Experience Class", 2000, 519, "2026-03-26"),
  draw("2026-09-14", "Provincial Nominee Program", 576, 734, "2026-08-29"),
  draw("2026-09-04", "Healthcare and social services", 3500, 475, "2026-05-26"),
  draw("2026-09-03", "Physicians", 229, 198, "2026-08-06"),
  draw("2026-09-01", "Canadian Experience Class", 2000, 521, "2026-08-18"),
  draw("2026-08-31", "Provincial Nominee Program", 562, 697, null),
  draw("2026-08-17", "Provincial Nominee Program", 442, 760, null),
  draw("2026-08-04", "Provincial Nominee Program", 507, 768, null),
  draw("2026-07-20", "Provincial Nominee Program", 511, 744, null),
  draw("2026-07-10", "Senior managers", 500, 392, null),
  draw("2026-07-06", "Provincial Nominee Program", 534, 708, null),
  draw("2026-06-22", "Provincial Nominee Program", 955, 730, null),
  draw("2025-11-12", "Canadian Experience Class", 1000, 515, null),
];

function draw(
  drawDate: string,
  drawType: string,
  invitations: number,
  minCrs: number,
  tieBreak: string | null,
): DrawRecord {
  return {
    id: `${drawDate}-${drawType}`,
    drawDate,
    drawType,
    invitations,
    minCrs,
    tieBreak,
    sourceUrl: IRCC_ROUNDS_URL,
    updatedAt: "2026-09-28T12:00:00.000Z",
  };
}

const FIRST_NAMES = [
  "Aman", "Priya", "Harman", "Simran", "Rahul", "Neha", "Jaspreet", "Ananya",
  "Karan", "Meera", "Arjun", "Divya", "Sandeep", "Pooja", "Vikram", "Isha",
  "Manpreet", "Ritika",
];

export const SEED_TESTIMONIALS: Testimonial[] = FIRST_NAMES.map((firstName, index) => {
  const base = 7 + (index % 4);
  const listening = Math.min(12, base + (index % 3));
  const reading = Math.min(12, base + ((index + 1) % 3));
  const writing = Math.min(12, base);
  const speaking = Math.min(12, base + (index % 2));
  const withBefore = index % 2 === 0;
  return {
    id: `t-${index + 1}`,
    firstName,
    listening,
    reading,
    writing,
    speaking,
    before: withBefore
      ? {
          Listening: Math.max(4, listening - 2),
          Reading: Math.max(4, reading - 1),
          Writing: Math.max(4, writing - 2),
          Speaking: Math.max(4, speaking - 1),
        }
      : null,
    quote: "The answer shape was the part I had been missing.",
    proofType: "Score report",
    firstAttempt: index % 3 === 0,
    consentReceivedAt: "2026-08-01T00:00:00.000Z",
    published: true,
    coveredProof: true,
    testDate: `2026-0${(index % 8) + 1}-15`,
  };
});

export type FaqEntry = { id: string; question: string; answer: string; order: number };

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "faq-1",
    order: 1,
    question: "Is CELPIP Decoded the official test?",
    answer:
      "No. CELPIP Decoded is independent practice. Levels you see here are practice estimates.",
  },
  {
    id: "faq-2",
    order: 2,
    question: "Do I need an account to try speaking?",
    answer: "No. You can record one Speaking Task 1 answer on the home page before you sign up.",
  },
  {
    id: "faq-3",
    order: 3,
    question: "What do I get for free?",
    answer:
      "One full mock, three writing and speaking evaluations, Section 1 of each course, the free tools, free mini-courses and Ask Amar.",
  },
  {
    id: "faq-4",
    order: 4,
    question: "Can you tell me if I will get permanent residence?",
    answer:
      "No. We coach the English test. We do not give immigration advice or predict an invitation.",
  },
];

export type WhichAnswerItem = {
  id: string;
  prompt: string;
  left: string;
  right: string;
  higher: "left" | "right";
  leftLevel: number;
  rightLevel: number;
  explanation: string;
};

export const WHICH_ANSWER: WhichAnswerItem = {
  id: "shape-1",
  prompt: "A friend asks why you missed the study group. Which reply is clearer?",
  left: "Sorry I could not come because of some things that happened and I was busy with stuff.",
  right:
    "Sorry I missed the group. My shift ended late, so I could not reach the library before it closed.",
  higher: "right",
  leftLevel: 6,
  rightLevel: 9,
  explanation:
    "The second reply has a reason, a time and a result. The first reply is vague, so the reader has to guess.",
};

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  body: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  publishedAt: string | null;
  heroAlt: string;
  kind: "blog" | "resource";
};

export const SEED_POSTS: BlogPost[] = [
  {
    slug: "answer-shape",
    title: "Most CELPIP trouble is answer shape",
    metaTitle: "Answer shape for CELPIP practice",
    metaDescription: "Why a clear answer shape matters more than rare vocabulary in CELPIP practice.",
    excerpt: "A short answer with a clear shape often outscores a long one.",
    body: "Start with who, what and why. Then add one detail. That shape works in writing and speaking practice.",
    tags: ["writing", "speaking"],
    author: "Amardeep Sihag",
    status: "published",
    publishedAt: "2026-09-01",
    heroAlt: "A notebook with a three-part answer outline",
    kind: "blog",
  },
  {
    slug: "how-to-use-the-free-mock",
    title: "How to use the free mock",
    metaTitle: "How to use the free CELPIP practice mock",
    metaDescription: "A short guide to sitting the free CELPIP Decoded mock before you buy anything.",
    excerpt: "Sit it once in Test mode and write down the section that felt hardest.",
    body: "Use the free mock to find a section, not to collect a number. The level you see is a practice estimate.",
    tags: ["mocks"],
    author: "Amardeep Sihag",
    status: "published",
    publishedAt: "2026-09-10",
    heroAlt: "A student at a desk with headphones",
    kind: "resource",
  },
];

export type Product = {
  code: "free" | "test_sprint" | "decoded_course" | "live_batch" | "private_1to1";
  name: string;
  priceCents: number;
  billing: string;
  bestFor: string;
  contents: string[];
};

export const PRODUCTS: Product[] = [
  {
    code: "free",
    name: "Free",
    priceCents: 0,
    billing: "Forever",
    bestFor: "Finding out where you stand before spending anything.",
    contents: [
      "1 full mock test",
      "CRS calculator, draws page and score diagnostic",
      "Section 1 video for all four modules",
      "3 writing and speaking evaluations",
      "Free PDF guides",
      "Free mini-courses",
      "Ask Amar",
    ],
  },
  {
    code: "test_sprint",
    name: "Test Sprint",
    priceCents: 4900,
    billing: "Monthly, renews automatically, cancel any time",
    bestFor: "Someone who has attempted CELPIP and is chasing a specific score.",
    contents: [
      "Everything in Free",
      "All mock tests",
      "AI-evaluated writing and speaking, up to the daily, weekly and monthly limits",
      "Templates",
      "Full answer history",
      "Dashboard with the weak section and what to do about it",
    ],
  },
  {
    code: "decoded_course",
    name: "Decoded Course",
    priceCents: 19900,
    billing: "One time, kept for life",
    bestFor: "Someone learning CELPIP from the base, then working at their own pace.",
    contents: [
      "3 months of Test Sprint, starting on the purchase date",
      "Every task type explained",
      "All modules in English and Hindi, with later languages when they go live",
      "WhatsApp community access",
      "Lifetime access to everything added later",
    ],
  },
  {
    code: "live_batch",
    name: "Live Batch",
    priceCents: 9900,
    billing: "Per 2-week block of 8 classes",
    bestFor: "Someone who wants live practice and a fixed schedule.",
    contents: [
      "8 live classes over 2 weeks, Monday, Tuesday, Thursday and Friday, 7:30 to 8:30 PM Eastern",
      "Maximum 8 students",
      "Homework reviewed before the next class",
      "Recordings",
    ],
  },
  {
    code: "private_1to1",
    name: "Private 1:1",
    priceCents: 4900,
    billing: "Per hour",
    bestFor: "Someone who knows which module is the problem.",
    contents: ["One scheduled hour, built around the student's score report."],
  },
];
