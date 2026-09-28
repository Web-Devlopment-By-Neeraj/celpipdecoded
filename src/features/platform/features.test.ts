import { describe, expect, it } from "vitest";
import { bestSingleChange } from "./crs-best";
import { calculate, seedCrsPoints, type CrsProfile, type LanguageAbilities } from "./crs";
import {
  countWords,
  evaluateWriting,
  markupToHtml,
  wordRangeFlag,
  WRITING_FAILURE_MESSAGE,
} from "./writing";
import {
  audioTypeAccepted,
  evaluateSpeaking,
  NO_SPEECH_MESSAGE,
  submittedTake,
  TEXT_ONLY_NOTICE,
} from "./speaking";
import {
  allowanceSnapshot,
  coursePeriod,
  createUserLock,
  dispatchWaiting,
  placeSubmission,
  sectionNeedsNotice,
} from "./allowance";
import { activeSamples, summarizeBatch } from "./calibration";
import { acceptAnswer, buildScript, defaultPartTimings, moveAttempt, remainingSeconds, replaySaves, syncAttempt, type AttemptClock } from "./player";
import { assembleChunks, mediaControls, prepExpired, resumeMediaOffset, task5PrepShows, task5Timeout } from "./speaking-player";
import { handlePaymentEvent, emptyPaymentState, renewalReminderDue } from "./payments";
import { addInteracSeat, cancelSeat, countTowardMinimum, markChargeFailed, releaseUnderfilled, reserveSeat, type BatchState } from "./batches";
import { batchClassEvents, bookableSlots, reconciliationMismatches, releaseUnpaidHolds, upsertBooking } from "./calendar";
import { lessonContentSecurityPolicy, lessonTokenValid, LESSON_IFRAME_SANDBOX, parseLessonMessage, recordLessonMessages, validateLessonHtml } from "./lessons";
import { authorizePlayback, DEFAULT_LANGUAGES, lessonCompleted, playbackTokenExpired, seekAfterLanguageSwitch } from "./video";
import { assistantCapReached, ASSISTANT_CAP_MESSAGE, HANDOVER_MESSAGE, IMMIGRATION_NOTICE, kbEntryFromReply, respondToStudent } from "./assistant";
import { choosePattern, completePrescription, createPrescription, MINI_COURSES, offerPrescription, proveCopy, readingListeningPatterns, repracticeSet, writingSpeakingPatterns } from "./loop";
import { cohortCsv, cohortReport } from "./cohort";
import { defaultSettings } from "./settings";
import { zonedParts } from "./time";

const lang = (level: LanguageAbilities["reading"]): LanguageAbilities => ({
  reading: level,
  writing: level,
  listening: level,
  speaking: level,
});

const baseProfile: CrsProfile = {
  age: 29,
  education: "bachelors",
  firstLanguage: lang(9),
  secondLanguage: null,
  canadianWorkYears: 1,
  withSpouse: false,
  foreignWorkYears: 0,
  hasTradeCertificate: false,
  provincialNomination: false,
  canadianStudy: "none",
  frenchNclc: null,
  siblingInCanada: false,
  jobOffer: "none",
};

const price = defaultSettings()["ai.price_table"];

describe("CRS calculator", () => {
  const table = seedCrsPoints();
  const settings = { jobOfferAwarded: false };

  it("matches three reference profiles", () => {
    expect(calculate(baseProfile, table, settings).total).toBe(469);
    expect(calculate(baseProfile, table, settings).areas).toMatchObject({
      core: 394,
      spouse: 0,
      transferability: 75,
      additional: 0,
    });

    const withSpouse = calculate(
      {
        ...baseProfile,
        age: 32,
        education: "masters",
        firstLanguage: lang(8),
        canadianWorkYears: 0,
        withSpouse: true,
        spouseEducation: "secondary",
        spouseLanguage: lang(5),
        spouseCanadianWorkYears: 0,
        foreignWorkYears: 3,
      },
      table,
      settings,
    );
    expect(withSpouse.total).toBe(355);
    expect(withSpouse.areas.spouse).toBe(6);

    const full = calculate(
      {
        ...baseProfile,
        age: 25,
        education: "doctoral",
        firstLanguage: lang(10),
        secondLanguage: lang(7),
        canadianWorkYears: 3,
        foreignWorkYears: 3,
        hasTradeCertificate: true,
        canadianStudy: "three_plus",
        frenchNclc: 7,
        siblingInCanada: true,
      },
      table,
      settings,
    );
    expect(full.total).toBe(667);
    expect(full.areas.transferability).toBe(100);
    expect(full.areas.additional).toBe(95);
  });

  it("uses an edited points row and keeps a job offer at zero", () => {
    const edited = table.map((row) =>
      row.factor === "cap:transferability" ? { ...row, points: 10 } : row,
    );
    expect(calculate(baseProfile, edited, settings).areas.transferability).toBe(10);

    const offer = calculate({ ...baseProfile, jobOffer: "senior" }, table, settings);
    expect(offer.lines.find((line) => line.factor === "additional:job_offer")?.points).toBe(0);
    const awarded = calculate({ ...baseProfile, jobOffer: "senior" }, table, { jobOfferAwarded: true });
    expect(awarded.total - offer.total).toBe(200);
  });

  it("drops spouse points when the applicant is single", () => {
    const single = calculate({ ...baseProfile, withSpouse: false, spouseEducation: "doctoral" }, table, settings);
    expect(single.areas.spouse).toBe(0);
  });

  it("names language as the biggest gain at CLB 7", () => {
    const profile: CrsProfile = {
      ...baseProfile,
      education: "doctoral",
      firstLanguage: lang(7),
      canadianWorkYears: 5,
    };
    const best = bestSingleChange(profile, table, settings);
    expect(best.kind).toBe("language");
    expect(best.text.toLowerCase()).toContain("language");
    expect(best.gain).toBeGreaterThan(0);
  });
});

describe("writing evaluation", () => {
  it("counts words on the server and flags the range", () => {
    expect(countWords("well-known plan")).toBe(2);
    expect(wordRangeFlag(140, 150, 200).inRange).toBe(false);
    expect(wordRangeFlag(150, 150, 200).inRange).toBe(true);
    expect(wordRangeFlag(200, 160, 210).inRange).toBe(true);
  });

  it("stores four criteria and escapes markup", async () => {
    const payload = {
      task: "writing_task_1",
      word_count: 1,
      in_range: true,
      criteria: ["content_coherence", "vocabulary", "readability", "task_fulfilment"].map((name) => ({
        name,
        level: 8,
        evidence: "a phrase",
        next_level_gap: "more detail",
      })),
      overall_level: 8,
      mistakes: [{ original: "teh", correction: "the", criterion: "readability" }],
      rewrite_next_level: "next",
      rewrite_top_level: "top",
      markup: "Hello [-teh-] {+the+} <script>alert(1)</script>",
      is_estimate: true,
    };
    const result = await evaluateWriting(
      {
        task: "writing_task_1",
        promptText: "Write an email.",
        textBody: "one ".repeat(160),
        wordMin: 150,
        wordMax: 200,
        promptVersion: "writing_v1",
        modelId: "test-model",
        priceTable: price,
        maxAttempts: 3,
      },
      async () => ({ raw: JSON.stringify(payload), inputTokens: 10, outputTokens: 10 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.criterionRows).toHaveLength(4);
    expect(result.evaluation.word_count).toBe(160);
    expect(result.modelVersion).toContain("writing_v1");
    expect(result.costCents).toBeGreaterThanOrEqual(0);
    const html = markupToHtml(payload.markup);
    expect(html).toContain("<del>teh</del>");
    expect(html).toContain("<strong>the</strong>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("[-");
  });

  it("does not spend allowance when the model keeps returning invalid JSON", async () => {
    const result = await evaluateWriting(
      {
        task: "writing_task_1",
        promptText: "Write an email.",
        textBody: "hello",
        wordMin: 150,
        wordMax: 200,
        promptVersion: "writing_v1",
        modelId: "test-model",
        priceTable: price,
        maxAttempts: 3,
      },
      async () => ({ raw: "not-json", inputTokens: 1, outputTokens: 1 }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.allowanceUsed).toBe(false);
    expect(result.studentMessage).toBe(WRITING_FAILURE_MESSAGE);
    expect(result.attempts).toBe(3);
  });
});

describe("speaking evaluation", () => {
  it("does not call the model for a short recording", async () => {
    let audioScores = 0;
    const result = await evaluateSpeaking({
      task: "speaking_task_1",
      audioId: "a",
      secondsSpoken: 3,
      mime: "audio/mp4",
      submitted: true,
      minSeconds: 5,
      modelId: "audio-model",
      promptVersion: "speaking_v1",
      priceTable: price,
      maxAttempts: 3,
      model: {
        transcribe: async () => {
          throw new Error("no asr");
        },
        scoreAudio: async () => {
          audioScores += 1;
          return { raw: "{}", audioSeconds: 3, inputTokens: 1, outputTokens: 1 };
        },
        scoreText: async () => ({ raw: "{}", inputTokens: 1, outputTokens: 1 }),
      },
    });
    expect(audioScores).toBe(0);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.studentMessage).toBe(NO_SPEECH_MESSAGE);
    expect(result.allowanceUsed).toBe(false);
  });

  it("scores audio directly and falls back to text only", async () => {
    const audio = {
      task: "speaking_task_1",
      transcript_verbatim: "um I I went to the store",
      seconds_spoken: 1,
      criteria: ["content_coherence", "vocabulary", "listenability", "task_fulfilment"].map((name) => ({
        name,
        level: 7,
        evidence: "um",
        next_level_gap: "fewer fillers",
      })),
      delivery: {
        pronunciation: { assessed: true, comment: "clear" },
        rhythm: { assessed: true, comment: "steady" },
        intonation: { assessed: true, comment: "varied" },
      },
      assessment_mode: "audio",
      overall_level: 7,
      mistakes: [],
      rewrite_next_level: "next",
      rewrite_top_level: "top",
      is_estimate: true,
    };
    const ok = await evaluateSpeaking({
      task: "speaking_task_1",
      audioId: "a",
      secondsSpoken: 90,
      mime: "audio/webm;codecs=opus",
      submitted: true,
      minSeconds: 5,
      modelId: "audio-model",
      promptVersion: "speaking_v1",
      priceTable: price,
      maxAttempts: 2,
      model: {
        transcribe: async () => "nope",
        scoreAudio: async () => ({ raw: JSON.stringify(audio), audioSeconds: 90, inputTokens: 5, outputTokens: 5 }),
        scoreText: async () => ({ raw: "{}", inputTokens: 1, outputTokens: 1 }),
      },
    });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.evaluation.assessment_mode).toBe("audio");
    expect(ok.calls.transcriptions).toBe(0);
    expect(ok.evaluation.transcript_verbatim).toContain("um");
    expect(audioTypeAccepted("audio/mp4")).toBe(true);

    const fallback = await evaluateSpeaking({
      task: "speaking_task_1",
      audioId: "a",
      secondsSpoken: 90,
      mime: "audio/mp4",
      submitted: true,
      minSeconds: 5,
      modelId: "audio-model",
      promptVersion: "speaking_v1",
      priceTable: price,
      maxAttempts: 1,
      model: {
        transcribe: async () => "um uh I started",
        scoreAudio: async () => {
          throw new Error("no audio");
        },
        scoreText: async () => ({ raw: JSON.stringify(audio), inputTokens: 2, outputTokens: 2 }),
      },
    });
    expect(fallback.ok).toBe(true);
    if (!fallback.ok) return;
    expect(fallback.evaluation.assessment_mode).toBe("text_only");
    expect(fallback.evaluation.delivery.pronunciation.comment).toBe("Not assessed");
    expect(TEXT_ONLY_NOTICE.toLowerCase()).toContain("transcript only");
    expect(submittedTake([{ takeNo: 1, submitted: false, seconds: 10, mime: "audio/mp4" }, { takeNo: 2, submitted: true, seconds: 10, mime: "audio/mp4" }])?.takeNo).toBe(2);
  });
});

describe("allowance queue", () => {
  const limits = { freeTotal: 3, daily: 10, weekly: 50, monthly: 200, extraCount: 0 };
  const now = new Date("2026-09-29T18:31:00.000Z");

  it("holds a free account's fourth answer", () => {
    const events = [1, 2, 3].map(() => ({ completedAt: new Date("2026-01-01T00:00:00Z"), status: "done" as const }));
    const snap = allowanceSnapshot({
      plan: "free",
      limits,
      events,
      reserved: 0,
      waitingCount: 0,
      now,
      timeZone: "America/Toronto",
      period: null,
    });
    expect(snap.blockedBy).toBe("free");
    const placed = placeSubmission(false, {
      id: "s4",
      userId: "u",
      createdAt: now,
      status: "queued",
      taskType: "writing_task_1",
    });
    expect(placed.status).toBe("waiting_allowance");
    const released = dispatchWaiting([placed], 2);
    expect(released.dispatched).toEqual(["s4"]);
  });

  it("lets one of two simultaneous reserves through", async () => {
    const lock = createUserLock();
    let left = 1;
    let dispatched = 0;
    await Promise.all(
      [0, 1].map(() =>
        lock("user", async () => {
          if (left > 0) {
            left -= 1;
            dispatched += 1;
          }
        }),
      ),
    );
    expect(dispatched).toBe(1);
  });

  it("blocks the 11th sprint evaluation until local midnight", () => {
    const events = Array.from({ length: 10 }, () => ({
      completedAt: new Date("2026-09-29T15:00:00.000Z"),
      status: "done" as const,
    }));
    const toronto = allowanceSnapshot({
      plan: "sprint",
      limits,
      events,
      reserved: 0,
      waitingCount: 1,
      now: new Date("2026-09-29T16:00:00.000Z"),
      timeZone: "America/Toronto",
      period: { start: new Date("2026-09-01T00:00:00Z"), end: new Date("2026-10-01T00:00:00Z") },
    });
    expect(toronto.blockedBy).toBe("day");
    expect(toronto.resetLabel).toContain("12:00 AM");
    expect(sectionNeedsNotice(8, toronto.leftToday)).toContain("8");
  });

  it("slices a course sprint into months from the purchase date", () => {
    const period = coursePeriod(new Date("2026-01-15T00:00:00Z"), new Date("2026-03-01T00:00:00Z"), 3);
    expect(period?.start.toISOString()).toBe("2026-02-15T00:00:00.000Z");
    expect(coursePeriod(new Date("2026-01-15T00:00:00Z"), new Date("2026-05-01T00:00:00Z"), 3)).toBeNull();
  });
});

describe("player", () => {
  const timings = defaultPartTimings();
  const listening = {
    conversations: [
      { id: "a", questionCount: 3, audioSeconds: 40 },
      { id: "b", questionCount: 3, audioSeconds: 40 },
      { id: "c", questionCount: 2, audioSeconds: 40 },
    ],
    part2: { audioSeconds: 50, questions: 5 },
    part3: { audioSeconds: 50, questions: 6 },
    part4: { audioSeconds: 60, questions: 5 },
    part5: { videoSeconds: 70, questions: 8 },
    part6: { audioSeconds: 55, questions: 6 },
    introVideoSeconds: 20,
    instructionVideoSeconds: 15,
  };

  it("builds the listening script with two pauses and frozen timings", () => {
    const practice = buildScript({ scope: "listening", mode: "practice", timings, listening });
    expect(practice[0]?.id).toBe("listening-instructions");
    expect(practice.filter((item) => item.kind === "pause")).toHaveLength(2);
    expect(practice.find((item) => item.id === "listening-results")).toBeTruthy();
    const full = buildScript({ scope: "full", mode: "test", timings, listening });
    expect(full[0]?.id).toBe("test-intro");
    expect(full.find((item) => item.id === "listening-results")).toBeUndefined();
    expect(full.at(-1)?.id).toBe("final-results");
    const longer = timings.map((row) =>
      row.partType === "reading" && row.screen === "part1" ? { ...row, seconds: 720 } : row,
    );
    const first = buildScript({ scope: "reading", mode: "practice", timings, listening });
    const second = buildScript({ scope: "reading", mode: "practice", timings: longer, listening });
    expect(first.find((item) => item.id === "reading-part1")?.seconds).toBe(660);
    expect(second.find((item) => item.id === "reading-part1")?.seconds).toBe(720);
  });

  it("rejects a late test answer and a backwards move", () => {
    const screens = buildScript({ scope: "reading", mode: "test", timings, listening });
    const attempt: AttemptClock = {
      mode: "test",
      screens,
      index: screens.findIndex((item) => item.id === "reading-part1"),
      screenStartedAt: new Date("2026-09-29T12:00:00Z"),
      answers: { q1: "a" },
      timeExceeded: false,
    };
    const during = new Date(attempt.screenStartedAt.getTime() + 60_000);
    expect(remainingSeconds(attempt, during)).toBe(600);
    expect(acceptAnswer(attempt, new Date(attempt.screenStartedAt.getTime() + 660_000 + 5_000), 1500)).toBe(false);
    expect(moveAttempt(attempt, "back", during).ok).toBe(false);

    const practiceScreens = buildScript({ scope: "reading", mode: "practice", timings, listening });
    const practice: AttemptClock = {
      ...attempt,
      mode: "practice",
      screens: practiceScreens,
      index: practiceScreens.findIndex((item) => item.id === "reading-part2"),
    };
    expect(moveAttempt(practice, "back", during).ok).toBe(false);
    const samePart = moveAttempt({ ...practice, index: practice.index }, "next", during);
    expect(samePart.ok).toBe(true);
  });

  it("fast-forwards a test attempt and keeps practice on the same screen", () => {
    const screens = buildScript({ scope: "listening", mode: "test", timings, listening }).filter(
      (item) => item.seconds !== null,
    );
    const attempt: AttemptClock = {
      mode: "test",
      screens,
      index: 0,
      screenStartedAt: new Date("2026-09-29T12:00:00Z"),
      answers: {},
      timeExceeded: false,
    };
    const away = syncAttempt(attempt, new Date(attempt.screenStartedAt.getTime() + 5 * 60 * 1000));
    expect(away.notice).toContain("Time kept running");
    const practice = syncAttempt({ ...attempt, mode: "practice" }, new Date(attempt.screenStartedAt.getTime() + 120_000));
    expect(practice.attempt.index).toBe(0);
    expect(practice.notice).toContain("Time is up");
    const replay = replaySaves([
      { idempotencyKey: "a", screenId: "s", answers: { q: "1" } },
      { idempotencyKey: "a", screenId: "s", answers: { q: "9" } },
      { idempotencyKey: "b", screenId: "s", answers: { q: "2" } },
    ]);
    expect(replay.applied).toHaveLength(2);
    expect(replay.answers.q).toBe("2");
  });
});

describe("calibration", () => {
  it("flags a generous batch and keeps retired samples out of new runs", () => {
    const samples = [
      { id: "a", label: "A", knownLevel: 7, retiredAt: null },
      { id: "b", label: "B", knownLevel: 8, retiredAt: new Date() },
    ];
    expect(activeSamples(samples).map((sample) => sample.id)).toEqual(["a"]);
    const summary = summarizeBatch(
      samples,
      [
        { sampleId: "a", batchId: "old", modelVersion: "m1", scoredLevel: 7, runAt: new Date("2026-01-01"), costCents: 5 },
        { sampleId: "a", batchId: "new", modelVersion: "m2", scoredLevel: 9, runAt: new Date("2026-02-01"), costCents: 6 },
      ],
      "new",
      0.5,
    );
    expect(summary.rows[0]?.delta).toBe(2);
    expect(summary.rows[0]?.previousLevel).toBe(7);
    expect(summary.driftingGenerous).toBe(true);
    expect(summary.modelChanged).toBe(true);
  });
});

describe("speaking player and media", () => {
  it("auto-starts test recording and waits in practice", () => {
    expect(prepExpired({ mode: "test", phase: "prep", taskNumber: 1, choice: null, choiceAutoSelected: false, takes: [], prepDone: false }).phase).toBe("recording");
    expect(prepExpired({ mode: "practice", phase: "prep", taskNumber: 1, choice: null, choiceAutoSelected: false, takes: [], prepDone: false }).phase).toBe("ready");
    expect(task5Timeout(null, "test")).toEqual({ choice: "A", autoSelected: true, advance: true });
    expect(task5PrepShows("B", "third")).toEqual(["B", "third"]);
    expect(mediaControls("test").seekable).toBe(false);
    expect(mediaControls("practice").back10).toBe(true);
    const offset = resumeMediaOffset(new Date("2026-09-29T12:00:00Z"), new Date("2026-09-29T12:00:12Z"), 40);
    expect(offset).toBe(12);
    expect(assembleChunks([{ index: 0, bytes: 10 }, { index: 1, bytes: 15 }]).totalBytes).toBe(25);
  });
});

describe("payments and batches", () => {
  const now = new Date("2026-09-29T12:00:00Z");

  it("grants a course once and ignores a replay", () => {
    const event = {
      id: "evt_1",
      type: "checkout.completed" as const,
      userId: "u",
      productCode: "course",
      providerRef: "pi_1",
      amountCents: 19900,
      taxCents: 2587,
    };
    const once = handlePaymentEvent(emptyPaymentState(), event, now, 3);
    const twice = handlePaymentEvent(once, event, now, 3);
    expect(twice.purchases).toHaveLength(1);
    expect(twice.entitlements.map((item) => item.productCode).sort()).toEqual(["course", "sprint"]);
    expect(twice.purchases[0]?.taxCents).toBe(2587);
    const refunded = handlePaymentEvent(twice, { ...event, id: "evt_2", type: "charge.refunded", fullRefund: true }, now);
    expect(refunded.entitlements.every((item) => item.revokedAt)).toBe(true);
    expect(renewalReminderDue(new Date(now.getTime() + 3 * 86400000 - 1000), now, 3)).toBe(true);
  });

  it("charges the third reservation and releases an under-filled batch", () => {
    const batch = {
      id: "b1",
      startsOn: new Date(now.getTime() + 2 * 86400000),
      seatCap: 8,
      minToRun: 3,
      status: "open" as const,
      zoomLink: "https://zoom.example/room",
    };
    let state: BatchState = { batches: [batch], seats: [], charges: [], emails: [], events: [], refundTasks: [], processedWebhooks: new Set() };
    state = reserveSeat(state, { batchId: "b1", userId: "a", webhookId: "w1", seatId: "s1" }).state;
    state = reserveSeat(state, { batchId: "b1", userId: "b", webhookId: "w2", seatId: "s2" }).state;
    expect(state.charges).toHaveLength(0);
    state = reserveSeat(state, { batchId: "b1", userId: "c", webhookId: "w3", seatId: "s3" }).state;
    expect(state.batches[0]?.status).toBe("confirmed");
    expect(state.charges).toHaveLength(3);
    const replay = reserveSeat(state, { batchId: "b1", userId: "c", webhookId: "w3", seatId: "s3" }).state;
    expect(replay.seats).toHaveLength(3);

    const failed = markChargeFailed(state, "s3");
    expect(failed.seats.find((seat) => seat.id === "s3")?.status).toBe("payment_failed");
    expect(failed.seats.filter((seat) => seat.status === "charged")).toHaveLength(2);

    let quiet: BatchState = {
      batches: [{ ...batch, id: "b2", startsOn: new Date(now.getTime() + 2 * 86400000) }],
      seats: [],
      charges: [],
      emails: [],
      events: [],
      refundTasks: [],
      processedWebhooks: new Set(),
    };
    quiet = reserveSeat(quiet, { batchId: "b2", userId: "a", webhookId: "q1", seatId: "q1" }).state;
    quiet = reserveSeat(quiet, { batchId: "b2", userId: "b", webhookId: "q2", seatId: "q2" }).state;
    quiet = addInteracSeat(quiet, { id: "i1", batchId: "b2", userId: "i", status: "charged", method: "interac", purchaseId: "pi" });
    expect(countTowardMinimum(quiet.seats, "b2")).toBe(3);

    let thin: BatchState = {
      batches: [{ ...batch, id: "b3" }],
      seats: [
        { id: "t1", batchId: "b3", userId: "a", status: "reserved", method: "card", purchaseId: null },
        { id: "t2", batchId: "b3", userId: "b", status: "reserved", method: "card", purchaseId: null },
      ],
      charges: [],
      emails: [],
      events: [],
      refundTasks: [],
      processedWebhooks: new Set(),
    };
    thin = releaseUnderfilled(thin, now, 3, "b4");
    expect(thin.batches[0]?.status).toBe("not_running");
    expect(thin.charges).toHaveLength(0);
    expect(thin.events).toContain("batch_released");

    const moved = cancelSeat(
      {
        ...state,
        batches: [{ ...state.batches[0], startsOn: new Date(now.getTime() + 72 * 3600 * 1000) }],
      },
      "s1",
      now,
      48,
      { ...batch, id: "next" },
    );
    expect(moved.moved).toBe(true);
    const late = cancelSeat(state, "s1", new Date(state.batches[0].startsOn.getTime() - 24 * 3600 * 1000), 48, { ...batch, id: "next" });
    expect(late.moved).toBe(false);
  });
});

describe("calendar, lessons, video", () => {
  it("keeps class times at 7:30pm Eastern across the fall clock change", () => {
    const events = batchClassEvents(new Date("2026-10-26T16:00:00Z"), "https://zoom.example/batch");
    expect(events).toHaveLength(8);
    for (const event of events) {
      const parts = zonedParts(event.startsAt, "America/Toronto");
      expect(parts.hour).toBe(19);
      expect(parts.minute).toBe(30);
    }
    const slots = [{ start: new Date("2026-10-01T15:00:00Z"), end: new Date("2026-10-01T16:00:00Z") }];
    expect(bookableSlots(slots, [{ start: slots[0].start, end: slots[0].end }], [], "America/Toronto")).toHaveLength(0);
    const bookings = upsertBooking([], {
      id: "b",
      externalRef: "ext",
      userId: "u",
      kind: "private",
      startsAt: new Date("2026-10-01T15:00:00Z"),
      zoomJoinUrl: "https://zoom.example/1",
      status: "held",
      heldUntil: new Date("2026-10-01T15:15:00Z"),
    });
    const again = upsertBooking(bookings, { ...bookings[0], status: "confirmed" });
    expect(again).toHaveLength(1);
    expect(releaseUnpaidHolds(bookings, new Date("2026-10-01T15:16:00Z"))[0]?.status).toBe("cancelled");
    expect(reconciliationMismatches(again, [{ eventId: "ext", startsAt: new Date("2026-10-01T16:00:00Z") }])).toEqual(["b"]);
  });

  it("rejects a foreign lesson message and warns when report-back is missing", () => {
    expect(LESSON_IFRAME_SANDBOX).toBe("allow-scripts");
    expect(lessonContentSecurityPolicy("https://celpipdecoded.com")).toContain("connect-src 'none'");
    expect(parseLessonMessage({ type: "celpip-lesson", version: 1, event: "start", lesson_id: "grammar-gym" }, "https://evil.example", "https://lessons.celpipdecoded.com").ok).toBe(false);
    const parsed = parseLessonMessage({ type: "celpip-lesson", version: 1, event: "drill", lesson_id: "grammar-gym", drill_id: "d1", score: 8, max_score: 10 }, "https://lessons.celpipdecoded.com", "https://lessons.celpipdecoded.com");
    expect(parsed.ok).toBe(true);
    const events = recordLessonMessages({
      userId: "student",
      sessionId: "sess",
      maxMessages: 50,
      messages: [
        { type: "celpip-lesson", version: 1, event: "start", lesson_id: "grammar-gym" },
        { type: "celpip-lesson", version: 1, event: "start", lesson_id: "grammar-gym" },
        { type: "celpip-lesson", version: 1, event: "drill", lesson_id: "grammar-gym", drill_id: "d1", score: 8 },
        { type: "celpip-lesson", version: 1, event: "finish", lesson_id: "grammar-gym", score: 80 },
      ],
    });
    expect(events.map((event) => event.kind)).toEqual(["start", "drill", "finish"]);
    expect(validateLessonHtml("<html></html>", 5).warnings.length).toBeGreaterThan(0);
    expect(lessonTokenValid("lesson.user.1", new Date(10_000))).toBe(false);
  });

  it("limits a visitor to a preview token and keeps the playhead", () => {
    const now = new Date("2026-09-29T12:00:00Z");
    const english = DEFAULT_LANGUAGES.find((language) => language.code === "en");
    const video = { lessonId: "l1", lang: "en", videoId: "v", durationSec: 600, published: true };
    const visitor = authorizePlayback({
      hasCourse: false,
      isFreeLesson: false,
      language: english,
      video,
      previewSeconds: 120,
      ttlMinutes: 10,
      now,
    });
    expect(visitor.ok && visitor.mode).toBe("preview");
    if (visitor.ok) expect(visitor.maxSeconds).toBe(120);
    const paid = authorizePlayback({
      hasCourse: true,
      isFreeLesson: false,
      language: english,
      video,
      previewSeconds: 120,
      ttlMinutes: 10,
      now,
    });
    expect(paid.ok && paid.mode).toBe("full");
    const punjabi = DEFAULT_LANGUAGES.find((language) => language.code === "pa");
    expect(authorizePlayback({ hasCourse: true, isFreeLesson: false, language: punjabi, video, previewSeconds: 120, ttlMinutes: 10, now }).ok).toBe(false);
    expect(seekAfterLanguageSwitch(195, 180)).toBe(180);
    expect(lessonCompleted(550, 600, 0.9)).toBe(true);
    expect(playbackTokenExpired(new Date(now.getTime() - 1), now)).toBe(true);
  });
});

describe("assistant, loop, cohort", () => {
  const entries = [{ id: "kb1", question: "How do I cancel Test Sprint?", answer: "Open account settings and choose Cancel Test Sprint, then confirm.", active: true }];

  it("answers from the knowledge base and hands over the rest", () => {
    const hit = respondToStudent({
      question: "How do I cancel Test Sprint?",
      entries,
      studentMessagesInSession: 1,
      unresolvedLimit: 3,
      topK: 4,
      minSimilarity: 0.4,
      resolved: false,
    });
    expect(hit.handover).toBe(false);
    expect(hit.usedEntryIds).toEqual(["kb1"]);
    expect(hit.answer).toContain("AI assistant");

    const miss = respondToStudent({
      question: "What is the capital of Mars?",
      entries,
      studentMessagesInSession: 1,
      unresolvedLimit: 3,
      topK: 4,
      minSimilarity: 0.75,
      resolved: false,
    });
    expect(miss.answer).toBeNull();
    expect(miss.handoverReason).toBe("no_kb");

    const immigration = respondToStudent({
      question: "Will CLB 9 get me an ITA?",
      entries,
      studentMessagesInSession: 1,
      unresolvedLimit: 3,
      topK: 4,
      minSimilarity: 0.2,
      resolved: false,
    });
    expect(immigration.handover).toBe(true);
    expect(immigration.category).toBe("immigration");
    expect(IMMIGRATION_NOTICE).toContain("not a licensed immigration consultant");
    expect(HANDOVER_MESSAGE).toContain("passed this to Amar");

    const score = respondToStudent({
      question: "What score will I get?",
      entries,
      studentMessagesInSession: 1,
      unresolvedLimit: 3,
      topK: 4,
      minSimilarity: 0.2,
      resolved: false,
    });
    expect(score.answer).toBeNull();
    expect(score.handoverReason).toBe("score");

    const third = respondToStudent({
      question: "How do I cancel Test Sprint?",
      entries,
      studentMessagesInSession: 3,
      unresolvedLimit: 3,
      topK: 4,
      minSimilarity: 0.2,
      resolved: false,
    });
    expect(third.handoverReason).toBe("unresolved");
    expect(assistantCapReached(20, 20)).toBe(true);
    expect(ASSISTANT_CAP_MESSAGE).toContain("today's assistant limit");
    expect(kbEntryFromReply("How do I cancel?", "Use settings.", "q1").question).toBe("How do I cancel?");
  });

  it("prescribes one mini-course and proves the skill afterwards", () => {
    const other = (level: number) => [
      { name: "content_coherence" as const, level },
      { name: "vocabulary" as const, level },
      { name: "readability" as const, level: level - 2 },
      { name: "task_fulfilment" as const, level },
    ];
    const patterns = writingSpeakingPatterns(
      [
        { id: "1", module: "writing", criteria: other(8) },
        { id: "2", module: "writing", criteria: other(8) },
        { id: "3", module: "writing", criteria: other(8) },
      ],
      "writing",
      { wsWindow: 3, wsHits: 2, rlAccuracyBelow: 60, rlMinQuestions: 8, targetLevel: 9 },
    );
    expect(patterns[0]?.skillTag).toBe("readability");
    const created = createPrescription("u", patterns[0]);
    expect(created.prescription?.miniCourseId).toBe("grammar-gym");
    expect(writingSpeakingPatterns(
      [
        { id: "1", module: "writing", criteria: other(8) },
        {
          id: "2",
          module: "writing",
          criteria: other(8).map((item) =>
            item.name === "vocabulary" ? { ...item, level: 4 } : item.name === "readability" ? { ...item, level: 8 } : item,
          ),
        },
        {
          id: "3",
          module: "writing",
          criteria: other(8).map((item) =>
            item.name === "content_coherence" ? { ...item, level: 4 } : item.name === "readability" ? { ...item, level: 8 } : item,
          ),
        },
      ],
      "writing",
      { wsWindow: 3, wsHits: 2, rlAccuracyBelow: 60, rlMinQuestions: 8, targetLevel: 9 },
    )).toHaveLength(0);

    const questions = Array.from({ length: 8 }, (_, index) => ({ skillTag: "inference", correct: index < 4 }));
    const rl = readingListeningPatterns(questions, { wsWindow: 3, wsHits: 2, rlAccuracyBelow: 60, rlMinQuestions: 8, targetLevel: 9 });
    expect(createPrescription("u", rl[0]).prescription?.miniCourseId).toBe("inference-lab");
    expect(readingListeningPatterns(questions.slice(0, 7), { wsWindow: 3, wsHits: 2, rlAccuracyBelow: 60, rlMinQuestions: 8, targetLevel: 9 })).toHaveLength(0);

    const chosen = choosePattern(
      [
        { skillTag: "readability", level: 5, reason: "low" },
        { skillTag: "vocabulary", level: 8, reason: "higher" },
      ],
      9,
    );
    expect(chosen?.skillTag).toBe("readability");
    expect(offerPrescription(created.prescription, createPrescription("u", { skillTag: "vocabulary", level: 4, reason: "x" }).prescription)).toBeNull();
    const finished = completePrescription(created.prescription!, "grammar-gym", new Date());
    expect(finished.completedAt).toBeTruthy();
    const set = repracticeSet(
      [
        { id: "a", skillTag: "readability", seen: true },
        { id: "b", skillTag: "vocabulary", seen: false },
        { id: "c", skillTag: "readability", seen: false },
      ],
      "readability",
      10,
    );
    expect(set.map((item) => item.id)).toEqual(["c", "a"]);
    expect(proveCopy(5, 7)).toContain("Practice estimate");
    expect(createPrescription("u", { skillTag: "unknown-tag", level: 1, reason: "gap" }, MINI_COURSES).gapLogged).toBe(true);
  });

  it("aggregates cohort change without student names", () => {
    const sentAt = new Date("2026-01-01T00:00:00Z");
    const rows = Array.from({ length: 10 }, () => ({
      miniCourseId: "grammar-gym",
      skillTag: "readability",
      module: "writing" as const,
      plan: "free" as const,
      language: "en",
      sentAt,
      completedAt: new Date("2026-01-03T00:00:00Z"),
      levelBefore: 5,
      levelAfter: 6,
      proved: true,
      completedCourse: true,
    }));
    const report = cohortReport(rows, {}, 10);
    expect(report[0]?.sent).toBe(10);
    expect(report[0]?.meanChange).toBe(1);
    expect(report[0]?.tooFew).toBe(false);
    expect(cohortReport(rows.slice(0, 3), {}, 10)[0]?.tooFew).toBe(true);
    expect(cohortCsv(report)).toContain("grammar-gym");
    expect(cohortCsv(report)).not.toContain("@");
  });
});
