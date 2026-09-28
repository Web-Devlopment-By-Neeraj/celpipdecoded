// Small in-process job runner. Vercel cron calls the tick route, which
// claims due jobs, runs them, and writes failures to the dead-letter log
// after the retry budget is spent.

export type JobStatus = "pending" | "done" | "dead";

export type Job<T = unknown> = {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  status: JobStatus;
  runAt: Date;
  lastError?: string;
};

export type DeadLetter = {
  jobId: string;
  type: string;
  error: string;
  at: Date;
};

export async function runJob<T>(
  job: Job<T>,
  handler: (job: Job<T>) => Promise<void>,
  options: { maxAttempts: number; now: Date },
): Promise<{ job: Job<T>; deadLetter?: DeadLetter }> {
  try {
    await handler(job);
    return { job: { ...job, status: "done", attempts: job.attempts + 1 } };
  } catch (error) {
    const attempts = job.attempts + 1;
    const message = error instanceof Error ? error.message : "Job failed";
    if (attempts >= options.maxAttempts) {
      return {
        job: { ...job, status: "dead", attempts, lastError: message },
        deadLetter: {
          jobId: job.id,
          type: job.type,
          error: message,
          at: options.now,
        },
      };
    }
    return {
      job: { ...job, status: "pending", attempts, lastError: message },
    };
  }
}
