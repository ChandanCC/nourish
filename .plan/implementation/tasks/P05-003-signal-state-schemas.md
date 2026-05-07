# P05-003 — SignalState + BaselineSnapshot Schemas

**Phase:** 05 — Intelligence Engine
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P04-001
**Unlocks:** P05-004

---

## Purpose

Create the `SignalState` and `BaselineSnapshot` Mongoose models used to persist computed intelligence results.

## Why It Exists

The intelligence engine needs to persist its output so GET /api/home can return cached SIGNAL state without recomputing on every request. SignalState holds the current SIGNAL output; BaselineSnapshot holds the latest baseline computation result.

## Required Reading

- `engineering/data-architecture.md#SignalState` and `#BaselineSnapshot` — canonical schemas

## Exact Scope

**SignalState schema:**
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // unique index
  state: string,              // e.g. "READING", "BUILDING"
  subtitle: string | null,
  delta: string | null,
  patternQualifier: string | null,
  aiInstruction: string | null,
  computed_at: Date,
  is_stale: boolean           // true if recompute is pending
}
```

**BaselineSnapshot schema:**
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // unique index
  baseline_kcal: number,
  established: boolean,
  logged_days_used: number,
  computed_at: Date
}
```

Both: unique index on `userId` (one document per user).

## Out of Scope

- Writing to these models (P05-004, P05-005)
- Any reading logic

## Files Expected to Change

```
backend/src/models/SignalState.ts       (new)
backend/src/models/BaselineSnapshot.ts  (new)
```

## Acceptance Criteria

1. Both models export correctly
2. Unique index on `userId` exists for both
3. Build passes

## Estimated Complexity

S — <30 minutes. Schema definition only.

## Claude Execution Guidance

Read data-architecture.md for the canonical schemas. Implement exactly as specified. The `userId` field should be `type: Schema.Types.ObjectId, ref: 'User'`.
