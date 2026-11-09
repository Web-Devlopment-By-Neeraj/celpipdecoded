import { describe, expect, it } from "vitest";
import {
  authorLabelFromEmail,
  buildLessons,
  compareLessonFileNames,
  parseCommentBody,
  resolveInsideRoot,
  titleFromFileName,
} from "./catalog";
import { lessonPlayback } from "./access";
import { formatClock, remainingAtRate } from "./format";
import { durationSecondsFromBuffer, parseByteRange } from "./media";

describe("course lessons", () => {
  it("orders numbered files and keeps copy for a known video", () => {
    const lessons = buildLessons([
      "7. CELPIP Speaking Task 1 & 2.mp4",
      "notes.txt",
      "1. CELPIP Listening Task 1, 2 & 3.mp4",
      "6. CELPIP Writing Task 2.mp4",
    ]);

    expect(lessons.map((lesson) => lesson.title)).toEqual([
      "CELPIP Listening Task 1, 2 & 3",
      "CELPIP Writing Task 2",
      "CELPIP Speaking Task 1 & 2",
    ]);
    expect(lessons[0]?.description).toContain("Listening Tasks 1, 2, and 3");
    expect(lessons.map((lesson) => lesson.group)).toEqual([
      "Listening",
      "Writing",
      "Speaking",
    ]);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(3);
  });

  it("adds a video that has no hand-written copy", () => {
    const lessons = buildLessons(["4. CELPIP Reading Part 1.mp4"]);
    expect(lessons[0]?.title).toBe("CELPIP Reading Part 1");
    expect(lessons[0]?.group).toBe("Reading");
    expect(lessons[0]?.description.length).toBeGreaterThan(10);
  });

  it("rejects a file name that leaves the library folder", () => {
    expect(titleFromFileName("2. Intro.mp4")).toBe("Intro");
    expect(compareLessonFileNames("10. Later.mp4", "2. Early.mp4")).toBeGreaterThan(0);
    const root = "/library/english";
    expect(resolveInsideRoot(root, "..", "secrets.mp4")).toBeNull();
    expect(resolveInsideRoot(root, "1. Lesson.mp4")).toBe(`${root}/1. Lesson.mp4`);
  });
});

describe("course playback and comments", () => {
  it("gives a full lesson to a course holder and a preview to everyone else", () => {
    const paid = lessonPlayback({
      hasCourse: true,
      tier: "course",
      available: true,
      previewSeconds: 120,
      now: new Date("2026-11-03T00:00:00Z"),
    });
    const visitor = lessonPlayback({
      hasCourse: false,
      tier: "course",
      available: true,
      previewSeconds: 120,
      now: new Date("2026-11-03T00:00:00Z"),
    });
    const free = lessonPlayback({
      hasCourse: false,
      tier: "free",
      available: true,
      previewSeconds: 120,
      now: new Date("2026-11-03T00:00:00Z"),
    });
    expect(paid.ok && paid.mode).toBe("full");
    expect(visitor.ok && visitor.mode).toBe("preview");
    if (visitor.ok) expect(visitor.maxSeconds).toBe(120);
    expect(free.ok && free.mode).toBe("full");
  });

  it("keeps comment text short and builds a label from the email", () => {
    expect(parseCommentBody("  Hello   there  ")).toBe("Hello there");
    expect(parseCommentBody(" ")).toBeNull();
    expect(parseCommentBody("x".repeat(501))).toBeNull();
    expect(authorLabelFromEmail("amar.deep+tag@example.com")).toBe("amar deep tag");
    expect(authorLabelFromEmail(null)).toBe("Learner");
  });
});

describe("course video ranges", () => {
  it("caps an open range and honors a small probe", () => {
    expect(parseByteRange(null, 1000)).toBeNull();
    expect(parseByteRange("bytes=0-10", 1000)).toEqual({ start: 0, end: 10 });
    const open = parseByteRange("bytes=0-", 50_000_000);
    expect(open).toEqual({ start: 0, end: 8 * 1024 * 1024 - 1 });
    expect(parseByteRange("bytes=5000-", 100)).toBe("unsatisfiable");
    expect(parseByteRange("bytes=-20", 100)).toEqual({ start: 80, end: 99 });
  });

  it("reads duration from an mvhd atom", () => {
    const mvhd = Buffer.alloc(32);
    mvhd.writeUInt32BE(32, 0);
    mvhd.write("mvhd", 4, "latin1");
    mvhd.writeUInt8(0, 8);
    mvhd.writeUInt32BE(1000, 20);
    mvhd.writeUInt32BE(90_000, 24);
    const moov = Buffer.alloc(8 + mvhd.length);
    moov.writeUInt32BE(moov.length, 0);
    moov.write("moov", 4, "latin1");
    mvhd.copy(moov, 8);
    expect(durationSecondsFromBuffer(moov)).toBe(90);
  });

  it("formats the player clock and the speed-adjusted time left", () => {
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(3661)).toBe("1:01:01");
    expect(remainingAtRate(36 * 60, 0, 1.2)).toBe(30 * 60);
  });
});
