// Speaking task flow and listening media controls inside the player.
// Test mode starts recording by itself. Practice waits for a button and
// can record again. Only the submitted take is queued.

export type SpeakingPhase = "prep" | "ready" | "recording" | "review";

export type SpeakingFlow = {
  mode: "practice" | "test";
  phase: SpeakingPhase;
  taskNumber: number;
  choice: "A" | "B" | null;
  choiceAutoSelected: boolean;
  takes: Array<{ takeNo: number; submitted: boolean }>;
  prepDone: boolean;
};

export function startSpeakingTask(mode: "practice" | "test", taskNumber: number): SpeakingFlow {
  return {
    mode,
    phase: "prep",
    taskNumber,
    choice: null,
    choiceAutoSelected: false,
    takes: [],
    prepDone: false,
  };
}

export function prepExpired(flow: SpeakingFlow): SpeakingFlow {
  if (flow.mode === "test") {
    return { ...flow, phase: "recording", prepDone: true };
  }
  return { ...flow, phase: "ready", prepDone: true };
}

export function startRecording(flow: SpeakingFlow): SpeakingFlow {
  const takeNo = flow.takes.length + 1;
  return {
    ...flow,
    phase: "recording",
    takes: [...flow.takes, { takeNo, submitted: false }],
  };
}

export function finishRecording(flow: SpeakingFlow): SpeakingFlow {
  if (flow.mode === "test") return { ...flow, phase: "review" };
  return { ...flow, phase: "review" };
}

export function submitTake(flow: SpeakingFlow): SpeakingFlow {
  const last = flow.takes.length;
  return {
    ...flow,
    takes: flow.takes.map((take) => ({ ...take, submitted: take.takeNo === last })),
  };
}

export function recordAgain(flow: SpeakingFlow): SpeakingFlow {
  if (flow.mode === "test") return flow;
  return startRecording({ ...flow, phase: "ready" });
}

export function task5Timeout(choice: "A" | "B" | null, mode: "practice" | "test"): {
  choice: "A" | "B" | null;
  autoSelected: boolean;
  advance: boolean;
} {
  if (choice) return { choice, autoSelected: false, advance: mode === "test" };
  if (mode === "test") return { choice: "A", autoSelected: true, advance: true };
  return { choice: null, autoSelected: false, advance: false };
}

export function task5PrepShows(choice: "A" | "B", third: "third"): ["A" | "B", "third"] {
  return [choice, third];
}

export type MediaMode = "practice" | "test";

export type MediaControls = {
  pause: boolean;
  play: boolean;
  replay: boolean;
  back10: boolean;
  forward10: boolean;
  seekable: boolean;
};

export function mediaControls(mode: MediaMode): MediaControls {
  if (mode === "practice") {
    return {
      pause: true,
      play: true,
      replay: true,
      back10: true,
      forward10: true,
      seekable: true,
    };
  }
  return {
    pause: false,
    play: false,
    replay: false,
    back10: false,
    forward10: false,
    seekable: false,
  };
}

export function resumeMediaOffset(screenStartedAt: Date, serverNow: Date, durationSeconds: number): number {
  const elapsed = (serverNow.getTime() - screenStartedAt.getTime()) / 1000;
  return Math.min(durationSeconds, Math.max(0, elapsed));
}

export function assembleChunks(chunks: Array<{ index: number; bytes: number }>): {
  complete: boolean;
  totalBytes: number;
} {
  const sorted = [...chunks].sort((a, b) => a.index - b.index);
  const complete = sorted.every((chunk, index) => chunk.index === index);
  return {
    complete,
    totalBytes: sorted.reduce((sum, chunk) => sum + chunk.bytes, 0),
  };
}

export const MIC_DENIED_HELP =
  "Microphone access is off. On iPhone, open Settings, Safari, Microphone, and allow this site. On Android, open Chrome site settings and allow the microphone. The timed tasks will not start until a short test recording plays back.";
