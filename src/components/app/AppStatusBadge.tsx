import { cx } from "@/features/design/design-tokens";
import {
  getStatusToneStyle,
  type StatusToneName,
} from "@/features/design/status-styles";

// The one status pill for the app.
//
// Speaking and writing each had their own copy of the same tone classes.
// Both now map their feature tone onto a shared tone with the helpers in
// status-styles.ts and render this. Labels stay with the feature, only
// the colour lives here.

export type AppStatusBadgeProps = {
  tone: StatusToneName;
  children: React.ReactNode;
  // Adds a small colour dot before the label. Helpful where several
  // pills sit close together in a table.
  withDot?: boolean;
  className?: string;
};

export function AppStatusBadge({
  tone,
  children,
  withDot = false,
  className,
}: AppStatusBadgeProps) {
  const style = getStatusToneStyle(tone);

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        style.badge,
        className,
      )}
    >
      {withDot ? (
        <span
          aria-hidden
          className={cx("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)}
        />
      ) : null}
      {children}
    </span>
  );
}
