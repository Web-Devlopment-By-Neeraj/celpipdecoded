import { recordingCopy } from "@/features/speaking/practice-flow";

// Primary action for the review step. Disabled while the upload runs
// so the student cannot submit the same recording twice.
export function SubmitRecordingButton({
  uploading,
  onSubmit,
}: {
  uploading: boolean;
  onSubmit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={uploading}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {uploading ? recordingCopy.submitting : recordingCopy.submitRecording}
    </button>
  );
}
