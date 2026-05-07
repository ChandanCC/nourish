# P04-003 — DayAggregate Schema

**Phase:** 04 — Backend Data Layer
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P04-002
**Unlocks:** P04-004

---

## Purpose

Create the `DayAggregate` Mongoose model: a pre-computed daily totals document, one per user per day.

## Why It Exists

DayAggregate is the primary cache layer for nutrition data. It is cheaper to read a pre-computed aggregate than to re-query and sum all FoodEntry documents on every request. It is also the input data for the intelligence engine (Phase 05).

## Required Reading

- `engineering/data-architecture.md#DayAggregate` — canonical schema
- `decisions/010-no-redis-precomputed-docs-as-cache.md` — why DayAggregate replaces Redis

## Exact Scope

- Create `backend/src/models/DayAggregate.ts` with Mongoose schema:
  ```typescript
  {
    _id: ObjectId,
    userId: ObjectId,       // ref: User
    date: string,           // ISO date, YYYY-MM-DD, UTC
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
    entry_count: number,
    updated_at: Date
  }
  ```
- Add compound unique index: `{ userId, date }` — one document per user per day

## Out of Scope

- Computing the aggregate values (P04-004)
- Any reading or writing logic beyond the schema

## Files Expected to Change

```
backend/src/models/DayAggregate.ts      (new)
```

## Architecture Constraints

- Date field is always a string in `YYYY-MM-DD` format, always UTC — never a JavaScript Date object
- `{ userId, date }` unique index is critical — prevents duplicate aggregates

## Acceptance Criteria

1. DayAggregate model exports correctly
2. Compound unique index on `{ userId, date }` exists
3. Build passes

## Estimated Complexity

S — <30 minutes.

## Claude Execution Guidance

Read data-architecture.md for the canonical schema. Implement exactly as specified. The date field is `type: String` in the schema, not `type: Date`.
