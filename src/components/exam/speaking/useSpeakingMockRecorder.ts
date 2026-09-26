"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
  getBaseMimeType,
  isRecordingSupported,
  pickRecordingMimeType,
} from "@/features/speaking/audio-utils";
import type { SpeakingRecordingErrorKind } from "@/features/exam-engine/speaking-mock-types";

// The MediaRecorder lifecycle for one Speaking mock test task (EXAM-27).
//
// Why this is not src/components/speaking/useAudioRecorder.ts
// ----------------------------------------------------------
//
// That hook belongs to the standalone Speaking Practice flow, which this
// ticket must not change. It is read and not edited, and the pure part of
// it that both flows can share is genuinely shared: isRecordingSupported,
// pickRecordingMimeType and getBaseMimeType are imported above from
// src/features/speaking/audio-utils.ts rather than rewritten, so the two
// flows can never disagree about which container this browser records in.
//
// What is not shared is the error contract, and that is the whole reason
// this hook exists. The standalone hook reports a failure as a finished
// sentence from recordingCopy, which suits a screen that prints it. This
// section has to do more than print it: an unsupported browser gets no
// retry button because retrying cannot help, a blocked microphone gets
// one because changing a browser setting and pressing again does help,
// and both have different wording from an ordinary failure. Deciding that
// by comparing message strings would be a coupling nobody could safely
// reword either flow through, so this hook reports a
// SpeakingRecordingErrorKind and speaking-mock-copy.ts turns it into
// words.
//
// The structure below is deliberately the same as the standalone hook's,
// because that structure is correct and has been in production use: the
// stream is released on every exit path, the recorder callbacks read refs
// so they never call a stale handler, and everything is mount guarded so
// a learner who leaves while the permission prompt is open does not leave
// a live microphone behind.
//
// What it does not do, and this is the shape of the ticket:
//
// - it never uploads. No fetch, no Supabase client, no storage bucket
// - it never persists. No localStorage, no cookie, no database
// - it never asks for the microphone until start is called, which only
//   happens from the Start recording click handler
// - it never creates an object URL. The blob is handed up and the caller
//   decides what to do with it, which keeps the one URL per recording in
//   the same place as the state that holds it
//
// House style: normal hyphens only, no long hyphens or em dashes.

// Whether this browser can record at all, read safely during render.
//
// isRecordingSupported reads window and navigator, so calling it in a
// component body would answer false on the server and true in the
// browser, and the two answers would disagree at hydration. It also
// cannot be pushed into state from an effect, because this project's lint
// rules refuse that.
//
// useSyncExternalStore exists for exactly this: an external value read
// during render, with a separate answer for the server pass. The value
// never changes during a visit, so subscribe registers nothing and
// returns a cleanup that undoes nothing.
//
// The server answer is optimistic. A page rendered on the server draws
// the Start recording button, and a browser that turns out to have no
// MediaRecorder replaces it with the unsupported notice on its first
// client render. That way round is better than the reverse, where a
// button would pop into existence after hydration on every browser that
// can record, which is nearly all of them.
const subscribeToNothing = () => () => {};

export function useSpeakingRecordingSupported(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    isRecordingSupported,
    () => true,
  );
}

// One finished recording, as it leaves the hook.
export type SpeakingMockRecording = {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
};

export type UseSpeakingMockRecorderOptions = {
  // Fired once per finished recording, with the audio the browser
  // produced.
  onRecorded: (recording: SpeakingMockRecording) => void;
  // Fired when a recording could not be made or could not be finished.
  onError: (kind: SpeakingRecordingErrorKind) => void;
};

export function useSpeakingMockRecorder({
  onRecorded,
  onError,
}: UseSpeakingMockRecorderOptions) {
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

  // Unmount safety: stop the recorder and release the microphone.
  //
  // This is what makes leaving a task mid recording safe. The onstop
  // handler is mount guarded, so the abandoned take is dropped rather than
  // written into a map the screen has already left, and the microphone
  // light goes out with the screen rather than staying on until the tab
  // is closed.
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

  // Ask for the microphone and start recording.
  //
  // Resolves true only once the recorder is actually running, so the
  // caller can hold the recording clock until the microphone is live
  // rather than starting a countdown against a permission prompt.
  //
  // Stable identity through useCallback with no dependencies, because
  // every value it touches is a ref. That lets a caller reference it from
  // an effect without retriggering the effect, which is the same reason
  // the standalone hook does it.
  const start = useCallback(async (): Promise<boolean> => {
    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    // Already recording. Treat a second press as a no op rather than as a
    // second recorder over the same stream.
    const active = recorderRef.current;

    if (active && active.state !== "inactive") {
      return true;
    }

    // Checked here rather than only at render time, so a browser that
    // reports no MediaRecorder can never reach the constructor below.
    if (!isRecordingSupported()) {
      onErrorRef.current("unsupported");
      return false;
    }

    let stream: MediaStream;

    try {
      // The one and only permission request, and it happens here because
      // this function is only ever called from the Start recording click
      // handler. Opening the task screen asks for nothing.
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (cause) {
      const denied =
        cause instanceof DOMException &&
        (cause.name === "NotAllowedError" || cause.name === "SecurityError");

      if (mountedRef.current) {
        onErrorRef.current(denied ? "permission-denied" : "failed");
      }

      return false;
    }

    // The screen may have been left while the permission prompt was open.
    // Release the microphone instead of starting a recording nothing owns.
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
          onErrorRef.current("failed");
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

        // A zero byte recording is a failure rather than a very short
        // answer. Reporting it as one keeps an unplayable blob out of the
        // response map.
        if (blob.size === 0) {
          onErrorRef.current("failed");
          return;
        }

        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );

        onRecordedRef.current({ blob, mimeType, durationSeconds });
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      recorder.start();

      return true;
    } catch {
      stream.getTracks().forEach((track) => track.stop());

      if (mountedRef.current) {
        onErrorRef.current("failed");
      }

      return false;
    }
  }, []);

  // End an active recording. The finished audio arrives through
  // onRecorded, because that is when the browser has assembled it.
  //
  // Safe to call when nothing is recording, which is what makes a double
  // click on Stop harmless.
  const stop = useCallback(() => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  return { start, stop };
}
