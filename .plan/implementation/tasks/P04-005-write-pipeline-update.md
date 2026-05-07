# P04-005 — Write Pipeline Update

**Phase:** 04 — Backend Data Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-004
**Unlocks:** P04-006, P10-001, P10-003

---

## Purpose

Update `POST /api/logs` and `DELETE /api/logs/:id` to use DayAggregate recomputation and soft-delete respectively. Add idempotency key checking on POST.

## Why It Exists

Currently POST creates a FoodEntry and returns it. DELETE hard-deletes the entry. Neither triggers DayAggregate recomputation. This update makes the write pipeline production-correct: soft-delete only, aggregate recomputed on every write, idempotency keys prevent double-submission.

## Required Reading

- `decisions/009-sync-async-boundary-dayaggregate.md` — DayAggregate is synchronous
- `architecture/ARCHITECTURE_INVARIANTS.md#D-INV-01` — no hard deletes

## Exact Scope

**POST /api/logs:**
1. Check `idempotency_key` header (`X-Idempotency-Key`): if a FoodEntry with that key exists for this user, return `200` with the existing entry (not `409`)
2. Create the FoodEntry with `idempotency_key`, `source: 'ai_parsed'`
3. Call `computeDayAggregate(userId, date)` synchronously
4. Enqueue SIGNAL recompute job (async — fire and forget)
5. Return `201` with the new FoodEntry

**DELETE /api/logs/:id:**
1. Set `deleted_at: new Date()` on the FoodEntry (do not hard-delete)
2. Call `computeDayAggregate(userId, date)` synchronously
3. Enqueue SIGNAL recompute job (async — fire and forget)
4. Return `200`

## Out of Scope

- SIGNAL recompute job implementation (P05-005) — just enqueue a placeholder for now
- Zod validation (P10-003)

## Files Expected to Change

```
backend/src/routes/logs.ts              (update POST and DELETE handlers)
```

## Architecture Constraints

- `D-INV-01`: DELETE must set `deleted_at`, never call `.deleteOne()`
- `D-INV-04`: all queries must include `userId` filter
- DayAggregate recompute is awaited (sync); SIGNAL recompute is not awaited (async)
- Idempotency key: if key matches existing entry, return 200 with existing entry — not an error

## Acceptance Criteria

1. POST /api/logs with duplicate idempotency key returns 200 with existing entry (not 201)
2. POST /api/logs creates FoodEntry and updates DayAggregate before responding
3. DELETE /api/logs/:id sets `deleted_at` and does not remove the document
4. DELETE /api/logs/:id updates DayAggregate before responding
5. Build passes

## Edge Cases

- `X-Idempotency-Key` header missing → proceed without idempotency check (not required for all clients in v1.1)
- DELETE on an already-deleted entry → return 200 (idempotent)

## Failure Cases

- `computeDayAggregate` throws → return 500, do not leave the FoodEntry without an aggregate update

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Update the route handlers one at a time. POST first: add idempotency check at top, then create entry, then await aggregate, then fire-and-forget SIGNAL job (can be a TODO comment if P05-005 isn't done yet). DELETE second: change `.deleteOne()` to `.findOneAndUpdate()` with `{ $set: { deleted_at: new Date() } }`.
