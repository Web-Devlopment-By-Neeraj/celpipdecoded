// Progress and comments live in a private Storage bucket so a new course
// does not need a new table. The service role is the only reader. Callers
// have already checked the signed-in user.

import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createRateLimiter } from "@/features/platform/security";
import { authorLabelFromEmail, isStorageKey, parseCommentBody } from "./catalog";

const BUCKET = "course-library";

export type LessonProgress = {
  positionSeconds: number;
  completed: boolean;
  updatedAt: string;
};

export type StoredComment = {
  id: string;
  userId: string;
  authorLabel: string;
  body: string;
  createdAt: string;
};

const commentLimiter = createRateLimiter(() => Date.now());
let bucketReady: Promise<void> | null = null;

async function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.storage.listBuckets();
      if (error) throw new Error(error.message);
      if (data?.some((bucket) => bucket.name === BUCKET)) return;
      const created = await admin.storage.createBucket(BUCKET, { public: false });
      if (created.error && !/already exists/i.test(created.error.message)) {
        throw new Error(created.error.message);
      }
    })().catch((error: unknown) => {
      bucketReady = null;
      throw error;
    });
  }
  return bucketReady;
}

function progressPath(userId: string, courseSlug: string, lessonId: string): string {
  return `progress/${userId}/${courseSlug}/${lessonId}.json`;
}

function commentPrefix(courseSlug: string, lessonId: string): string {
  return `comments/${courseSlug}/${lessonId}`;
}

async function uploadJson(objectPath: string, value: unknown, upsert: boolean): Promise<void> {
  await ensureBucket();
  const admin = getSupabaseAdmin();
  const body = Buffer.from(JSON.stringify(value));
  const { error } = await admin.storage.from(BUCKET).upload(objectPath, body, {
    contentType: "application/json",
    upsert,
  });
  if (error) throw new Error(error.message);
}

async function downloadJson<T>(objectPath: string): Promise<T | null> {
  await ensureBucket();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage.from(BUCKET).download(objectPath);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return null;
  }
}

export async function loadProgressMap(
  userId: string,
  courseSlug: string,
): Promise<Record<string, LessonProgress>> {
  if (!isStorageKey(courseSlug)) return {};
  await ensureBucket();
  const admin = getSupabaseAdmin();
  const prefix = `progress/${userId}/${courseSlug}`;
  const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 200 });
  if (error || !data) return {};

  const entries = await Promise.all(
    data
      .filter((file) => file.name.endsWith(".json"))
      .map(async (file) => {
        const lessonId = file.name.replace(/\.json$/, "");
        const progress = await downloadJson<LessonProgress>(`${prefix}/${file.name}`);
        if (!progress || typeof progress.positionSeconds !== "number") return null;
        return [
          lessonId,
          {
            positionSeconds: progress.positionSeconds,
            completed: Boolean(progress.completed),
            updatedAt: typeof progress.updatedAt === "string" ? progress.updatedAt : "",
          },
        ] as const;
      }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is readonly [string, LessonProgress] => entry != null),
  );
}

export async function saveLessonProgress(input: {
  userId: string;
  courseSlug: string;
  lessonId: string;
  positionSeconds: number;
  completed: boolean;
  clearCompletion?: boolean;
}): Promise<void> {
  if (!isStorageKey(input.courseSlug) || !isStorageKey(input.lessonId)) {
    throw new Error("Unknown lesson.");
  }
  const objectPath = progressPath(input.userId, input.courseSlug, input.lessonId);
  const existing = input.clearCompletion
    ? null
    : await downloadJson<LessonProgress>(objectPath);
  const next: LessonProgress = {
    positionSeconds: input.positionSeconds,
    completed: input.clearCompletion
      ? false
      : input.completed || existing?.completed === true,
    updatedAt: new Date().toISOString(),
  };
  await uploadJson(objectPath, next, true);
}

export async function listComments(
  courseSlug: string,
  lessonId: string,
): Promise<StoredComment[]> {
  if (!isStorageKey(courseSlug) || !isStorageKey(lessonId)) return [];
  await ensureBucket();
  const admin = getSupabaseAdmin();
  const prefix = commentPrefix(courseSlug, lessonId);
  const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 100 });
  if (error || !data) return [];

  const comments = await Promise.all(
    data
      .filter((file) => file.name.endsWith(".json"))
      .map(async (file) => downloadJson<StoredComment>(`${prefix}/${file.name}`)),
  );

  return comments
    .filter((comment): comment is StoredComment => {
      return Boolean(
        comment &&
          typeof comment.id === "string" &&
          typeof comment.body === "string" &&
          typeof comment.userId === "string",
      );
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function commentRateDecision(userId: string): { ok: boolean; retryAfterSeconds: number } {
  return commentLimiter.hit(`course-comment:${userId}`, 30, 60 * 60 * 1000);
}

export async function addComment(input: {
  userId: string;
  email: string | null;
  courseSlug: string;
  lessonId: string;
  body: unknown;
}): Promise<StoredComment> {
  if (!isStorageKey(input.courseSlug) || !isStorageKey(input.lessonId)) {
    throw new Error("Unknown lesson.");
  }
  const body = parseCommentBody(input.body);
  if (!body) throw new Error("Write a comment of 500 characters or less.");

  const createdAt = new Date().toISOString();
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const comment: StoredComment = {
    id,
    userId: input.userId,
    authorLabel: authorLabelFromEmail(input.email),
    body,
    createdAt,
  };
  await uploadJson(`${commentPrefix(input.courseSlug, input.lessonId)}/${id}.json`, comment, false);
  return comment;
}

export async function deleteOwnComment(input: {
  userId: string;
  courseSlug: string;
  lessonId: string;
  commentId: string;
}): Promise<"deleted" | "missing" | "forbidden"> {
  if (!isStorageKey(input.courseSlug) || !isStorageKey(input.lessonId)) return "missing";
  if (!/^\d{10,16}-[a-z0-9-]{4,40}$/.test(input.commentId)) return "missing";
  const objectPath = `${commentPrefix(input.courseSlug, input.lessonId)}/${input.commentId}.json`;
  const existing = await downloadJson<StoredComment>(objectPath);
  if (!existing) return "missing";
  if (existing.userId !== input.userId) return "forbidden";
  await ensureBucket();
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([objectPath]);
  if (error) throw new Error(error.message);
  return "deleted";
}
