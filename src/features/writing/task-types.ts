// Types for the CELPIP writing task library.
// Stable task_type values match the seed data in
// supabase/migrations/008_writing_task_library.sql.

export const WRITING_TASK_TYPES = [
  "writing_email",
  "writing_survey_response",
] as const;

export type WritingTaskType = (typeof WRITING_TASK_TYPES)[number];

// Timing and evaluation details from public.writing_task_details.
export type WritingTaskDetails = {
  task_number: number | null;
  time_seconds: number;
  word_min: number | null;
  word_max: number | null;
  evaluation_focus: string[] | null;
};

// A writing task row from public.tasks joined with its details.
export type WritingTask = {
  id: string;
  task_type: string;
  title: string;
  prompt: string;
  status: string;
  sort_order: number;
  details: WritingTaskDetails | null;
};

// Safe fields passed from the timed writing server page into the
// client shell. Never include secrets or admin data here.
export type WritingPracticeTask = {
  id: string;
  title: string;
  taskNumber: number;
  prompt: string;
  timeSeconds: number;
  wordMin: number | null;
  wordMax: number | null;
  evaluationFocus: string[];
};

// Raw shape returned by the Supabase nested select before normalization.
// PostgREST returns a one-to-one embed as an object, but we accept an
// array too so the normalizer never breaks on a schema cache change.
export type WritingTaskRow = {
  id: string;
  task_type: string;
  title: string;
  prompt: string;
  status: string;
  sort_order: number;
  writing_task_details: WritingTaskDetails | WritingTaskDetails[] | null;
};
