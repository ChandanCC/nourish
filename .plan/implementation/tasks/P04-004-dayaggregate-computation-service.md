# P04-004 — DayAggregate Computation Service

**Phase:** 04 — Backend Data Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-003
**Unlocks:** P04-005, P05-001

---

## Purpose

Implement `computeDayAggregate(userId, date)` — the service function that queries all active FoodEntry documents for a user/day and upserts the DayAggregate document.

## Why It Exists

This is the core data computation function. It is called synchronously after every write (P04-005). The result feeds the home screen endpoint (P04-006) and the intelligence engine (Phase 05).

## Required Reading

- `engineering/data-architecture.md#DayAggregate` — schema and computation rules
- `decisions/009-sync-async-boundary-dayaggregate.md` — DayAggregate is sync, SIGNAL is async

## Exact Scope

- Create `backend/src/services/dayAggregate.ts`
- Implement `computeDayAggregate(userId: string, date: string): Promise<DayAggregate>`
  - Query: `FoodEntry.find({ userId, date, deleted_at: null })`
  - Sum: calories, protein, carbs, fat, fiber across all matching entries
  - Upsert: `DayAggregate.findOneAndUpdate({ userId, date }, { $set: { ...sums, entry_count, updated_at } }, { upsert: true, new: true })`
  - Return the upserted document

## Out of Scope

- Calling this function from the write pipeline (P04-005)
- SIGNAL recompute (P05-005)

## Files Expected to Change

```
backend/src/services/dayAggregate.ts    (new)
```

## Architecture Constraints

- `D-INV-04`: query must include userId filter
- Date string format: always `YYYY-MM-DD` UTC — never `new Date().toLocaleDateString()`
- The function is synchronous from the caller's perspective (await it directly in the route handler)

## Acceptance Criteria

1. `computeDayAggregate('userId', '2026-05-07')` returns a DayAggregate document
2. Only entries with `deleted_at: null` are included in the sum
3. An existing DayAggregate is updated (not duplicated) on re-computation
4. A new DayAggregate is created if none exists for that user/date
5. Build passes

## Edge Cases

- No FoodEntry documents for the user/date → create a DayAggregate with all zeros, `entry_count: 0`
- `date` parameter must be in `YYYY-MM-DD` format — if not, throw an error (validate at call site, not inside this function)

## Test Expectations

This function warrants an integration test or fixture test. Create a test in `backend/src/services/__tests__/dayAggregate.test.ts` with at least:
- Empty day → zeros
- Two entries on same day → correct sums
- One soft-deleted entry → excluded from sums

## Estimated Complexity

M — ~1.5 hours including basic tests.

## Claude Execution Guidance

Keep the function simple: query, reduce, upsert, return. Do not add caching, retries, or error recovery beyond what the framework provides. Write the test fixtures before implementing (fixture-first for any data computation function).
