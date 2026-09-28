// Server-authoritative mock script and timer.
//
// Durations come from part_timings rows. The script is frozen on the
// attempt, so a later timing edit does not move a test already in progress.
// Remaining time is deadline minus server time. The device clock is ignored.

export type ExamMode = "practice" | "test";
export type ExamScope = "full" | "listening" | "reading" | "writing" | "speaking";

export type PartTiming = {
  partType: string;
  screen: string;
  seconds: number;
  prepSeconds?: number;
  recordSeconds?: number;
};

export type ListeningBlueprint = {
  conversations: Array<{ id: string; questionCount: number; audioSeconds: number }>;
  part2: { audioSeconds: number; questions: number };
  part3: { audioSeconds: number; questions: number };
  part4: { audioSeconds: number; questions: number };
  part5: { videoSeconds: number; questions: number };
  part6: { audioSeconds: number; questions: number };
  introVideoSeconds: number;
  instructionVideoSeconds: number;
};

export type PlayerScreen = {
  id: string;
  partKey: string;
  kind: string;
  seconds: number | null;
  skippable: boolean;
  practiceOnly: boolean;
  completeOnly: boolean;
};

export function timingSeconds(
  timings: PartTiming[],
  partType: string,
  screen: string,
): number {
  const found = timings.find(
    (row) => row.partType === partType && row.screen === screen,
  );
  if (!found) throw new Error(`Missing part timing ${partType}/${screen}`);
  return found.seconds;
}

function screen(
  partial: Omit<PlayerScreen, "practiceOnly" | "completeOnly" | "skippable"> &
    Partial<Pick<PlayerScreen, "practiceOnly" | "completeOnly" | "skippable">>,
): PlayerScreen {
  return {
    skippable: false,
    practiceOnly: false,
    completeOnly: false,
    ...partial,
  };
}

export function defaultPartTimings(): PartTiming[] {
  const rows: PartTiming[] = [];
  const add = (
    partType: string,
    name: string,
    seconds: number,
    extra?: { prepSeconds?: number; recordSeconds?: number },
  ) => {
    rows.push({ partType, screen: name, seconds, ...extra });
  };

  add("listening", "instructions", 30);
  add("listening", "part_instructions", 30);
  add("listening", "picture", 30);
  add("listening", "context", 30);
  add("listening", "question", 30);
  add("listening", "conversation_pause", 10);
  add("listening", "part4_questions", 240);
  add("listening", "part5_questions", 300);
  add("listening", "part6_questions", 300);
  add("listening", "end", 30);

  add("reading", "instructions", 30);
  add("reading", "part1", 660);
  add("reading", "part2", 540);
  add("reading", "part3", 600);
  add("reading", "part4", 780);
  add("reading", "end", 30);

  add("writing", "instructions", 30);
  add("writing", "task1", 1620);
  add("writing", "task2", 1560);
  add("writing", "end", 30);

  add("speaking", "instructions", 30);
  add("speaking", "task_1", 30, { prepSeconds: 30, recordSeconds: 90 });
  add("speaking", "task_2", 30, { prepSeconds: 30, recordSeconds: 60 });
  add("speaking", "task_3", 30, { prepSeconds: 30, recordSeconds: 60 });
  add("speaking", "task_4", 30, { prepSeconds: 30, recordSeconds: 60 });
  add("speaking", "task_5_choose", 60);
  add("speaking", "task_5_prep", 60, { prepSeconds: 60 });
  add("speaking", "task_5_record", 60, { recordSeconds: 60 });
  add("speaking", "task_6", 60, { prepSeconds: 60, recordSeconds: 60 });
  add("speaking", "task_7", 30, { prepSeconds: 30, recordSeconds: 90 });
  add("speaking", "task_8", 30, { prepSeconds: 30, recordSeconds: 60 });
  add("speaking", "end", 30);
  return rows;
}

export function buildScript(input: {
  scope: ExamScope;
  mode: ExamMode;
  timings: PartTiming[];
  listening: ListeningBlueprint;
}): PlayerScreen[] {
  const { timings, listening, mode, scope } = input;
  const seconds = (part: string, name: string) => timingSeconds(timings, part, name);
  const screens: PlayerScreen[] = [];
  const include = (part: ExamScope) => scope === "full" || scope === part;

  if (scope === "full") {
    screens.push(
      screen({
        id: "test-intro",
        partKey: "intro",
        kind: "video",
        seconds: listening.introVideoSeconds,
        skippable: true,
        completeOnly: true,
      }),
    );
  }

  if (include("listening")) {
    screens.push(
      screen({
        id: "listening-instructions",
        partKey: "listening-instructions",
        kind: "instructions",
        seconds: seconds("listening", "instructions"),
      }),
      screen({
        id: "listening-instruction-video",
        partKey: "listening-instructions",
        kind: "video",
        seconds: listening.instructionVideoSeconds,
        skippable: true,
      }),
    );

    screens.push(
      screen({
        id: "listening-p1-instructions",
        partKey: "listening-1",
        kind: "instructions",
        seconds: seconds("listening", "part_instructions"),
      }),
      screen({
        id: "listening-p1-picture",
        partKey: "listening-1",
        kind: "picture",
        seconds: seconds("listening", "picture"),
      }),
    );

    listening.conversations.forEach((conversation, index) => {
      screens.push(
        screen({
          id: `listening-p1-audio-${conversation.id}`,
          partKey: "listening-1",
          kind: "audio",
          seconds: conversation.audioSeconds,
        }),
      );
      for (let question = 1; question <= conversation.questionCount; question += 1) {
        screens.push(
          screen({
            id: `listening-p1-q-${conversation.id}-${question}`,
            partKey: "listening-1",
            kind: "question",
            seconds: seconds("listening", "question"),
          }),
        );
      }
      if (index < listening.conversations.length - 1) {
        screens.push(
          screen({
            id: `listening-p1-pause-${index + 1}`,
            partKey: "listening-1",
            kind: "pause",
            seconds: seconds("listening", "conversation_pause"),
          }),
        );
      }
    });

    const singleQuestionParts = [
      { key: "listening-2", audio: listening.part2.audioSeconds, questions: listening.part2.questions, id: "p2" },
      { key: "listening-3", audio: listening.part3.audioSeconds, questions: listening.part3.questions, id: "p3" },
    ];
    for (const part of singleQuestionParts) {
      screens.push(
        screen({
          id: `listening-${part.id}-instructions`,
          partKey: part.key,
          kind: "instructions",
          seconds: seconds("listening", "part_instructions"),
        }),
        screen({
          id: `listening-${part.id}-context`,
          partKey: part.key,
          kind: "context",
          seconds: seconds("listening", "context"),
        }),
        screen({
          id: `listening-${part.id}-audio`,
          partKey: part.key,
          kind: "audio",
          seconds: part.audio,
        }),
      );
      for (let question = 1; question <= part.questions; question += 1) {
        screens.push(
          screen({
            id: `listening-${part.id}-q-${question}`,
            partKey: part.key,
            kind: "question",
            seconds: seconds("listening", "question"),
          }),
        );
      }
    }

    const grouped = [
      { key: "listening-4", id: "p4", media: listening.part4.audioSeconds, timing: "part4_questions", kind: "audio" },
      { key: "listening-5", id: "p5", media: listening.part5.videoSeconds, timing: "part5_questions", kind: "video" },
      { key: "listening-6", id: "p6", media: listening.part6.audioSeconds, timing: "part6_questions", kind: "audio" },
    ];
    for (const part of grouped) {
      screens.push(
        screen({
          id: `listening-${part.id}-instructions`,
          partKey: part.key,
          kind: "instructions",
          seconds: seconds("listening", "part_instructions"),
        }),
        screen({
          id: `listening-${part.id}-context`,
          partKey: part.key,
          kind: "context",
          seconds: seconds("listening", "context"),
        }),
        screen({
          id: `listening-${part.id}-media`,
          partKey: part.key,
          kind: part.kind,
          seconds: part.media,
        }),
        screen({
          id: `listening-${part.id}-questions`,
          partKey: part.key,
          kind: "questions",
          seconds: seconds("listening", part.timing),
        }),
      );
    }

    if (mode === "practice") {
      screens.push(
        screen({
          id: "listening-results",
          partKey: "listening-results",
          kind: "results",
          seconds: null,
          practiceOnly: true,
        }),
      );
    }
    screens.push(
      screen({
        id: "listening-end",
        partKey: "listening-end",
        kind: "end",
        seconds: seconds("listening", "end"),
      }),
    );
  }

  if (include("reading")) {
    screens.push(
      screen({
        id: "reading-instructions",
        partKey: "reading-instructions",
        kind: "instructions",
        seconds: seconds("reading", "instructions"),
      }),
      screen({
        id: "reading-instruction-video",
        partKey: "reading-instructions",
        kind: "video",
        seconds: listening.instructionVideoSeconds,
        skippable: true,
      }),
    );
    for (const part of ["part1", "part2", "part3", "part4"] as const) {
      screens.push(
        screen({
          id: `reading-${part}`,
          partKey: `reading-${part}`,
          kind: "passage",
          seconds: seconds("reading", part),
        }),
      );
    }
    if (mode === "practice") {
      screens.push(
        screen({
          id: "reading-results",
          partKey: "reading-results",
          kind: "results",
          seconds: null,
          practiceOnly: true,
        }),
      );
    }
    screens.push(
      screen({
        id: "reading-end",
        partKey: "reading-end",
        kind: "end",
        seconds: seconds("reading", "end"),
      }),
    );
  }

  if (include("writing")) {
    screens.push(
      screen({
        id: "writing-instructions",
        partKey: "writing-instructions",
        kind: "instructions",
        seconds: seconds("writing", "instructions"),
      }),
      screen({
        id: "writing-task-1",
        partKey: "writing-1",
        kind: "writing",
        seconds: seconds("writing", "task1"),
      }),
      screen({
        id: "writing-task-2",
        partKey: "writing-2",
        kind: "writing",
        seconds: seconds("writing", "task2"),
      }),
      screen({
        id: "writing-end",
        partKey: "writing-end",
        kind: "end",
        seconds: seconds("writing", "end"),
      }),
    );
  }

  if (include("speaking")) {
    screens.push(
      screen({
        id: "speaking-instructions",
        partKey: "speaking-instructions",
        kind: "instructions",
        seconds: seconds("speaking", "instructions"),
      }),
    );
    for (const task of [1, 2, 3, 4, 6, 7, 8]) {
      const row = timings.find(
        (item) => item.partType === "speaking" && item.screen === `task_${task}`,
      );
      if (!row) throw new Error(`Missing speaking task ${task}`);
      screens.push(
        screen({
          id: `speaking-${task}-prep`,
          partKey: `speaking-${task}`,
          kind: "prep",
          seconds: row.prepSeconds ?? row.seconds,
        }),
        screen({
          id: `speaking-${task}-record`,
          partKey: `speaking-${task}`,
          kind: "record",
          seconds: row.recordSeconds ?? row.seconds,
        }),
      );
    }
    screens.push(
      screen({
        id: "speaking-5-choose",
        partKey: "speaking-5",
        kind: "choice",
        seconds: seconds("speaking", "task_5_choose"),
      }),
      screen({
        id: "speaking-5-prep",
        partKey: "speaking-5",
        kind: "prep",
        seconds: seconds("speaking", "task_5_prep"),
      }),
      screen({
        id: "speaking-5-record",
        partKey: "speaking-5",
        kind: "record",
        seconds: seconds("speaking", "task_5_record"),
      }),
    );
    const task5Index = screens.findIndex((item) => item.id === "speaking-5-choose");
    const task6Index = screens.findIndex((item) => item.id === "speaking-6-prep");
    if (task5Index > task6Index && task6Index >= 0) {
      const task5 = screens.splice(task5Index, 3);
      screens.splice(task6Index, 0, ...task5);
    }
    screens.push(
      screen({
        id: "speaking-end",
        partKey: "speaking-end",
        kind: "end",
        seconds: seconds("speaking", "end"),
      }),
    );
  }

  if (mode === "test") {
    screens.push(
      screen({
        id: "final-results",
        partKey: "final-results",
        kind: "results",
        seconds: null,
      }),
    );
  }

  return screens;
}

export type AttemptClock = {
  mode: ExamMode;
  screens: PlayerScreen[];
  index: number;
  screenStartedAt: Date;
  answers: Record<string, string>;
  timeExceeded: boolean;
};

export function deadline(attempt: AttemptClock): Date | null {
  const current = attempt.screens[attempt.index];
  if (!current || current.seconds === null) return null;
  return new Date(attempt.screenStartedAt.getTime() + current.seconds * 1000);
}

export function remainingSeconds(attempt: AttemptClock, serverNow: Date): number | null {
  const ends = deadline(attempt);
  if (!ends) return null;
  return Math.max(0, Math.ceil((ends.getTime() - serverNow.getTime()) / 1000));
}

export function acceptAnswer(
  attempt: AttemptClock,
  serverNow: Date,
  graceMs: number,
): boolean {
  if (attempt.mode === "practice") return true;
  const ends = deadline(attempt);
  if (!ends) return true;
  return serverNow.getTime() <= ends.getTime() + graceMs;
}

export function moveAttempt(
  attempt: AttemptClock,
  direction: "next" | "back",
  serverNow: Date,
): { ok: true; attempt: AttemptClock } | { ok: false; status: 403; reason: string } {
  if (direction === "next") {
    const index = Math.min(attempt.index + 1, attempt.screens.length - 1);
    return {
      ok: true,
      attempt: {
        ...attempt,
        index,
        screenStartedAt: serverNow,
        timeExceeded: false,
      },
    };
  }

  if (attempt.mode === "test") {
    return { ok: false, status: 403, reason: "Back is not available in test mode." };
  }
  if (attempt.index === 0) {
    return { ok: false, status: 403, reason: "There is no previous screen." };
  }
  const current = attempt.screens[attempt.index];
  const previous = attempt.screens[attempt.index - 1];
  if (!current || !previous || current.partKey !== previous.partKey) {
    return { ok: false, status: 403, reason: "You can go back only within this part." };
  }
  return {
    ok: true,
    attempt: {
      ...attempt,
      index: attempt.index - 1,
      screenStartedAt: serverNow,
    },
  };
}

export function syncAttempt(
  attempt: AttemptClock,
  serverNow: Date,
): { attempt: AttemptClock; notice: string | null } {
  if (attempt.mode === "practice") {
    const ends = deadline(attempt);
    const timeExceeded = Boolean(ends && serverNow.getTime() >= ends.getTime());
    return {
      attempt: { ...attempt, timeExceeded },
      notice: timeExceeded
        ? "Time is up. In the real test, this screen would move on by itself."
        : null,
    };
  }

  let next = { ...attempt };
  let skipped = false;
  while (next.index < next.screens.length - 1) {
    const ends = deadline(next);
    if (!ends || serverNow.getTime() < ends.getTime()) break;
    skipped = true;
    next = {
      ...next,
      index: next.index + 1,
      screenStartedAt: ends,
    };
  }
  return {
    attempt: next,
    notice: skipped ? "Time kept running while you were away." : null,
  };
}

export type SaveOp = {
  idempotencyKey: string;
  screenId: string;
  answers: Record<string, string>;
};

export function replaySaves(queue: SaveOp[]): { applied: SaveOp[]; answers: Record<string, string> } {
  const seen = new Set<string>();
  const applied: SaveOp[] = [];
  const answers: Record<string, string> = {};
  for (const save of queue) {
    if (seen.has(save.idempotencyKey)) continue;
    seen.add(save.idempotencyKey);
    applied.push(save);
    Object.assign(answers, save.answers);
  }
  return { applied, answers };
}

export const PRACTICE_TIME_UP =
  "Time is up. In the real test, this screen would move on by itself.";
