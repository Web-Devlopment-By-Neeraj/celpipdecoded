"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getBaseMimeType,
  isRecordingSupported,
  pickRecordingMimeType,
} from "@/features/speaking/audio-utils";
import { recordingCopy } from "@/features/speaking/practice-flow";

// Owns the MediaRecorder lifecycle for the speaking phase. start()
// resolves true only once the microphone is live and recording has
// begun, so the caller can hold the speaking timer until then. stop()
// ends an active recording and the final audio arrives via onRecorded.
export function useAudioRecorder({
  onRecorded,
  onError,
}: {
  onRecorded: (blob: Blob, mimeType: string, durationSeconds: number) => void;
  onError: (message: string) => void;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const mountedRef = useRef(true);

  // Latest callbacks, so recorder event handlers never call stale ones.
  const onRecordedRef = useRef(onRecorded);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onRecordedRef.current = onRecorded;
    onErrorRef.current = onError;
  }, [onRecorded, onError]);

  // Unmount safety: stop the recorder and release the microphone. The
  // onstop handler is mount guarded, so nothing is delivered after this.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  // Stable identities so callers can reference start and stop from
  // effects without retriggering them. Both read refs only.
  const start = useCallback(async (): Promise<boolean> => {
    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const active = recorderRef.current;
    if (active && active.state !== "inactive") {
      return true;
    }

    if (!isRecordingSupported()) {
      onErrorRef.current(recordingCopy.errors.notSupported);
      return false;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (cause) {
      const denied =
        cause instanceof DOMException &&
        (cause.name === "NotAllowedError" || cause.name === "SecurityError");
      if (mountedRef.current) {
        onErrorRef.current(
          denied
            ? recordingCopy.errors.permissionDenied
            : recordingCopy.errors.recordingFailed,
        );
      }
      return false;
    }

    // The page may have been left while the permission prompt was open.
    // Release the microphone instead of starting an unmanaged recording.
    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return false;
    }

    try {
      const preferredType = pickRecordingMimeType();
      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        stopStream();
        if (mountedRef.current) {
          onErrorRef.current(recordingCopy.errors.recordingFailed);
        }
      };

      recorder.onstop = () => {
        stopStream();
        const mimeType = getBaseMimeType(
          recorder.mimeType || preferredType || "audio/webm",
        );
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        if (!mountedRef.current) {
          return;
        }
        if (blob.size === 0) {
          onErrorRef.current(recordingCopy.errors.recordingFailed);
          return;
        }
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        onRecordedRef.current(blob, mimeType, durationSeconds);
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      recorder.start();
      return true;
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      if (mountedRef.current) {
        onErrorRef.current(recordingCopy.errors.recordingFailed);
      }
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  return { start, stop };
}
