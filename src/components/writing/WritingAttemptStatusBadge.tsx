import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { toneFromWritingStatus } from "@/features/design/status-styles";
import {
  getWritingStatusLabel,
  getWritingStatusTone,
} from "@/features/writing/writing-status-labels";

// Small status pill for a writing attempt, shown in history rows and
// recent attempt cards.
//
// The labels and the status to tone mapping stay in the writing
// feature. The colours come from the shared design tones.
export function WritingAttemptStatusBadge({ status }: { status: string }) {
  return (
    <AppStatusBadge tone={toneFromWritingStatus(getWritingStatusTone(status))}>
      {getWritingStatusLabel(status)}
    </AppStatusBadge>
  );
}
