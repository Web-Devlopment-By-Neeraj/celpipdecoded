"use server";

import { buildListeningSectionResult, sanitizeListeningSectionAnswers } from "@/features/exam-engine/listening-section-score";
import type {
  ListeningSectionAnswerMap,
  ListeningSectionMarkedResult,
} from "@/features/exam-engine/listening-section-types";
import { sanitizeReadingSectionAnswers } from "@/features/exam-engine/reading-section-flow";
import { buildReadingSectionResult } from "@/features/exam-engine/reading-section-score";
import type {
  ReadingSectionAnswerMap,
  ReadingSectionMarkedResult,
} from "@/features/exam-engine/reading-section-types";
import {
  buildPublishedListeningContent,
  buildPublishedReadingContent,
  questionIdsInSection,
  type PublishedAnswerKey,
} from "@/features/mock-tests/published-exam-content";
import { getPublishedMockTestForLearner } from "@/features/mock-tests/published-mock-queries";
import type { LearnerMockTest } from "@/features/mock-tests/published-mock-catalog";
import { userHasPaidMockAccess } from "@/features/platform/fulfill-stripe-purchase";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Marks a published Listening or Reading section.
//
// The page builds the exam without answer keys and strips them again
// before the content reaches the browser. This action loads the keys,
// builds a second copy that never leaves the server, and returns only
// the review rows and the score.

export async function markPublishedListening(
  slug: string,
  answers: ListeningSectionAnswerMap,
): Promise<ListeningSectionMarkedResult | null> {
  const test = await loadMarkableTest(slug);

  if (!test) {
    return null;
  }

  const keys = await loadAnswerKeys(questionIdsInSection(test, "listening"));
  const content = keys ? buildPublishedListeningContent(test, keys) : null;

  if (!content || !keys) {
    return null;
  }

  return buildListeningSectionResult(
    content,
    sanitizeListeningSectionAnswers(content, answers),
  );
}

export async function markPublishedReading(
  slug: string,
  answers: ReadingSectionAnswerMap,
): Promise<ReadingSectionMarkedResult | null> {
  const test = await loadMarkableTest(slug);

  if (!test) {
    return null;
  }

  const keys = await loadAnswerKeys(questionIdsInSection(test, "reading"));
  const content = keys ? buildPublishedReadingContent(test, keys) : null;

  if (!content || !keys) {
    return null;
  }

  return buildReadingSectionResult(
    content,
    sanitizeReadingSectionAnswers(content, answers),
  );
}

async function loadMarkableTest(slug: string): Promise<LearnerMockTest | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await userHasPaidMockAccess(user.id))) {
    return null;
  }

  return getPublishedMockTestForLearner(slug);
}

async function loadAnswerKeys(
  questionIds: string[],
): Promise<PublishedAnswerKey[] | null> {
  if (questionIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdmin()
    .from("mock_test_answer_keys")
    .select("question_id, correct_option_id, explanation")
    .in("question_id", questionIds);

  if (error) {
    return null;
  }

  return (
    (data ?? []) as {
      question_id: string;
      correct_option_id: string | null;
      explanation: string | null;
    }[]
  ).map((row) => ({
    questionId: row.question_id,
    correctOptionId: row.correct_option_id,
    explanation: row.explanation ?? undefined,
  }));
}
