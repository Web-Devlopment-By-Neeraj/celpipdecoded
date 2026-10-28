import type { ReactNode } from "react";
import { buttonBase, cx } from "@/features/design/design-tokens";

/** Shared pill for the full-mock and section actions. Same height as other dashboard buttons. */
export const mockTestRowButtonClass = cx(
  buttonBase,
  "h-11 w-full min-w-0 px-4 text-center text-sm",
);

/**
 * One row: full mock takes about 35% and the four section buttons share the rest.
 * A single grid keeps the gap between every button the same.
 */
export function MockTestPracticeButtonRow({
  fullMock,
  sections,
}: {
  fullMock: ReactNode;
  sections: ReactNode;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-[minmax(0,7fr)_repeat(4,minmax(0,3.25fr))] sm:gap-4">
      <div className="col-span-2 min-w-0 sm:col-span-1">{fullMock}</div>
      {sections}
    </div>
  );
}
