# P05-005 — SIGNAL Recompute Job

**Phase:** 05 — Intelligence Engine
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P05-004
**Unlocks:** P06-003

---

## Purpose

Implement the async SIGNAL recompute job that is enqueued after every FoodEntry write, running `computeSIGNAL(userId)` in the background.

## Why It Exists

SIGNAL recomputation is too slow to run synchronously on every food log write. It is dequeued and run asynchronously by the job-worker Lambda. The write pipeline (P04-005) enqueues this job; this task implements the job handler.

## Required Reading

- `decisions/009-sync-async-boundary-dayaggregate.md` — async boundary definition
- `engineering/backend-architecture.md#job-worker` — Lambda job worker architecture

## Exact Scope

Create `backend/src/jobs/recomputeSignal.ts`:

```typescript
interface RecomputeSignalPayload {
  userId: string;
}

async function recomputeSignal(payload: RecomputeSignalPayload): Promise<void>
```

- Calls `computeSIGNAL(payload.userId)`
- Before starting: set `is_stale: true` on the user's SignalState (marks it as computing)
- After completion: `is_stale` is updated to `false` by the orchestrator when it writes the new SignalState

Create job enqueue helper:

```typescript
// backend/src/jobs/index.ts
async function enqueueRecomputeSignal(userId: string): Promise<void>
```

For v1.1: the "queue" is a simple `setTimeout(..., 0)` or immediate async invocation (no SQS yet — see stack.md for v1.1 scope). The job runs in the same process. Mark with a TODO for SQS migration.

Update `POST /api/logs` and `DELETE /api/logs/:id` (from P04-005) to call `enqueueRecomputeSignal`.

## Out of Scope

- SQS queue (v1.2 item)
- Job retry logic
- Dead letter handling

## Files Expected to Change

```
backend/src/jobs/recomputeSignal.ts     (new)
backend/src/jobs/index.ts               (new — enqueue helpers)
backend/src/routes/logs.ts              (call enqueueRecomputeSignal after writes)
```

## Architecture Constraints

- The job is fire-and-forget from the route handler — do not await it in the request path
- Failures in the job must not affect the HTTP response
- Set `is_stale: true` before the job runs so the frontend knows recompute is in progress

## Acceptance Criteria

1. After POST /api/logs, SignalState `is_stale` is set to true
2. After job runs, SignalState is updated with new computed state
3. Job failure does not return a 500 to the client
4. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Keep the job implementation minimal: set stale, call computeSIGNAL, done. The enqueue helper in index.ts uses `Promise.resolve().then(() => recomputeSignal({ userId }))` for fire-and-forget. Add a clear TODO comment for the SQS migration path.
