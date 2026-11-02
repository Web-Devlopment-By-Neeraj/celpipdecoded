import { cx } from "@/features/design/design-tokens";

// Initial avatar for a student. There are no student photos on the site,
// so each name gets one of a few brand tints, picked from the name so a
// student keeps the same colour on every page.

const tints = [
  "bg-academy-blue-soft text-academy-blue",
  "bg-academy-navy-soft text-academy-navy",
  "bg-amber-100 text-amber-900",
] as const;

function tintFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tints[hash % tints.length];
}

export function StudentAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        tintFor(name),
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
