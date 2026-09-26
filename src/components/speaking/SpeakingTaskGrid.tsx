import type { SpeakingTask } from "@/features/speaking/task-types";
import { SpeakingTaskCard } from "./SpeakingTaskCard";

// Responsive grid of speaking task cards. Cards stack on mobile and
// spread to two columns from the sm breakpoint.
export function SpeakingTaskGrid({ tasks }: { tasks: SpeakingTask[] }) {
  return (
    <section className="mt-8" aria-label="Speaking task types">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
        Speaking task types
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {tasks.map((task) => (
          <SpeakingTaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
