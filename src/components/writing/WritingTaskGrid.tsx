import type { WritingTask } from "@/features/writing/task-types";
import {
  getTaskTypeGroupTitle,
  groupTasksByType,
} from "@/features/writing/task-utils";
import { WritingTaskCard } from "./WritingTaskCard";

// Task library grouped by CELPIP writing task type. Cards stack on
// mobile and spread to two columns from the sm breakpoint.
export function WritingTaskGrid({ tasks }: { tasks: WritingTask[] }) {
  const groups = groupTasksByType(tasks);

  return (
    <div className="mt-8 space-y-10">
      {groups.map((group) => (
        <section
          key={group.taskType}
          aria-label={getTaskTypeGroupTitle(group.taskType)}
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
            {getTaskTypeGroupTitle(group.taskType)}
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {group.tasks.map((task) => (
              <WritingTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
