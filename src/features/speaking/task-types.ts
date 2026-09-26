// Types for the CELPIP speaking task library.
// Stable task_type values match the seed data in
// supabase/migrations/003_seed_speaking_tasks.sql.

export const SPEAKING_TASK_TYPES = [
  "giving_advice",
  "personal_experience",
  "describing_scene",
  "making_predictions",
  "comparing_persuading",
  "difficult_situation",
  "expressing_opinions",
  "unusual_situation",
] as const;

export type SpeakingTaskType = (typeof SPEAKING_TASK_TYPES)[number];

// Timing and scoring details from public.speaking_task_details.
export type SpeakingTaskDetails = {
  task_number: number | null;
  prep_seconds: number;
  speaking_seconds: number;
  scoring_focus: string[] | null;
};

// A speaking task row from public.tasks joined with its details.
export type SpeakingTask = {
  id: string;
  task_type: string;
  title: string;
  prompt: string;
  status: string;
  sort_order: number;
  details: SpeakingTaskDetails | null;
};

// Raw shape returned by the Supabase nested select before normalization.
// PostgREST returns a one-to-one embed as an object, but we accept an
// array too so the normalizer never breaks on a schema cache change.
export type SpeakingTaskRow = {
  id: string;
  task_type: string;
  title: string;
  prompt: string;
  status: string;
  sort_order: number;
  speaking_task_details: SpeakingTaskDetails | SpeakingTaskDetails[] | null;
};
