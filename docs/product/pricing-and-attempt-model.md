# Pricing and Attempt Model

Status: planned direction. Nothing in this document is implemented yet.
No payment, attempt counting, recording, transcription, or AI scoring
exists in the app as of SPEAKING-02.

## Product

Toronto Academy CELPIP Practice - CELPIP Speaking Practice module.

The product should feel professional and credible. Marketing and UI copy
must not promise unlimited free questions, free AI scoring, official
CELPIP scores, or guaranteed scores. Feedback is a practice estimate
only.

## What counts as a scored attempt

A scored attempt is one fully completed feedback cycle:

1. The user records an answer
2. The user submits it for AI feedback
3. Transcription runs
4. AI feedback is generated
5. The result card is saved

Only step 5 completes an attempt. If the flow stops at any earlier
point, no attempt is consumed.

### Never counted as an attempt

- Opening a task
- Reading a prompt
- Starting a timer or running a timed practice session
- Cancelling before or during recording
- A failed upload
- A failed AI response

This rule protects users from paying for errors and keeps the model
easy to trust: you pay only for feedback you actually receive.

## Planned pricing

| Plan | Price | Scored attempts |
| --- | --- | --- |
| Free preview | Free | 1 scored speaking attempt |
| Starter Pack | $5 | 5 scored attempts |
| Practice Pack | $10 | 12 scored attempts |
| Monthly Practice Plan | $20/month | Up to 40 scored attempts per month |

Notes:

- Packs are one-time purchases of a fixed attempt balance.
- The monthly plan caps at 40 scored attempts per calendar month of the
  subscription; unused attempts do not roll over.
- Timed practice sessions without AI feedback remain free, because they
  never produce a scored attempt.

## Implementation guidance for later tickets

- Attempt consumption must be recorded server side, only after the AI
  feedback result is saved successfully.
- Failed pipelines (upload, transcription, AI generation) must not
  decrement any balance, and retries of a failed submission must not
  double-charge.
- The UI should always show the remaining attempt balance before the
  user submits a recording for feedback.
