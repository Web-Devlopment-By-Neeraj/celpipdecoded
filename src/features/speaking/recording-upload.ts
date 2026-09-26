// Submits a finished recording from the browser: creates the attempt
// row, uploads the audio to the private attempt-audio bucket, then
// marks the attempt as uploaded. Runs entirely with the logged-in
// user's browser client, so RLS and storage policies enforce access.
// Never import the admin client here.

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ATTEMPT_AUDIO_BUCKET,
  buildAttemptAudioPath,
  getBaseMimeType,
} from "./audio-utils";
import { recordingCopy } from "./practice-flow";

export type SubmitRecordingInput = {
  taskId: string;
  moduleId: string;
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
};

export type SubmitRecordingResult =
  | { ok: true; attemptId: string }
  | { ok: false; message: string };

export async function submitRecording(
  input: SubmitRecordingInput,
): Promise<SubmitRecordingResult> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: recordingCopy.errors.sessionExpired };
  }

  // 1. Create the attempt row first so the storage path can include the
  // attempt id. The status stays "created" until the upload succeeds,
  // so this never counts as a scored attempt.
  const { data: attempt, error: insertError } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      module_id: input.moduleId,
      task_id: input.taskId,
      status: "created",
    })
    .select("id")
    .single();

  if (insertError || !attempt) {
    return { ok: false, message: recordingCopy.errors.attemptSaveFailed };
  }

  // 2. Upload the audio into the user's own folder. Storage policies
  // only allow paths whose first segment is the user's own id.
  const contentType = getBaseMimeType(input.mimeType);
  const audioPath = buildAttemptAudioPath(user.id, attempt.id, contentType);

  const { error: uploadError } = await supabase.storage
    .from(ATTEMPT_AUDIO_BUCKET)
    .upload(audioPath, input.blob, { contentType, upsert: false });

  if (uploadError) {
    // Best effort marker so a half-finished attempt is identifiable.
    await supabase
      .from("attempts")
      .update({ status: "failed_upload" })
      .eq("id", attempt.id);
    return { ok: false, message: recordingCopy.errors.uploadFailed };
  }

  // 3. Mark the attempt as uploaded with its final audio details.
  const { error: updateError } = await supabase
    .from("attempts")
    .update({
      status: "uploaded",
      audio_path: audioPath,
      audio_duration_seconds: Math.max(1, Math.round(input.durationSeconds)),
      submitted_at: new Date().toISOString(),
    })
    .eq("id", attempt.id);

  if (updateError) {
    return { ok: false, message: recordingCopy.errors.attemptSaveFailed };
  }

  return { ok: true, attemptId: attempt.id };
}
