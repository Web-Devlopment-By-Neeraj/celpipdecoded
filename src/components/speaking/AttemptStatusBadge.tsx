import { AppStatusBadge } from "@/components/app/AppStatusBadge";
import { toneFromSpeakingStatus } from "@/features/design/status-styles";
import {
  getAttemptStatusLabel,
  getAttemptStatusTone,
} from "@/features/speaking/attempt-history";

// Small status pill for an attempt, shown in history rows and cards.
//
// The labels and the status to tone mapping stay in the speaking
// feature. The colours now come from the shared design tones, so
// speaking and writing pills cannot drift apart.
export function AttemptStatusBadge({ status }: { status: string }) {
  return (
    <AppStatusBadge tone={toneFromSpeakingStatus(getAttemptStatusTone(status))}>
      {getAttemptStatusLabel(status)}
    </AppStatusBadge>
  );
}
