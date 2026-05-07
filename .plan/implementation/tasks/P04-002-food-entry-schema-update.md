# P04-002 — FoodEntry Schema Update

**Phase:** 04 — Backend Data Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** —
**Unlocks:** P04-003

---

## Purpose

Update the existing `FoodEntry` Mongoose model to add soft-delete, meal_label, idempotency_key, and source fields.

## Why It Exists

The current FoodEntry schema lacks: soft-delete support (needed for P04-005), meal labeling (needed for AI context), idempotency keys (needed to prevent double-submission on retry), and a source field (needed to distinguish AI-parsed vs. manual entries).

## Required Reading

- `engineering/data-architecture.md#FoodEntry` — canonical updated schema
- `architecture/ARCHITECTURE_INVARIANTS.md#D-INV-01` — FoodEntry is immutable after creation (soft-delete only)

## Exact Scope

Add the following fields to the existing FoodEntry Mongoose schema:

```typescript
{
  // existing fields remain unchanged
  deleted_at: Date | null,         // null = active, timestamp = soft-deleted
  meal_label: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null,
  idempotency_key: string | null,  // UUID v4, unique sparse index
  source: 'ai_parsed' | 'manual'   // default: 'ai_parsed'
}
```

Add indexes:
- `idempotency_key`: unique sparse index (sparse = nulls not indexed)
- `userId + deleted_at` compound index (for efficient active-only queries)

Update existing queries in the codebase that fetch entries to add `{ deleted_at: null }` filter.

## Out of Scope

- Write pipeline update (P04-005)
- Soft-delete endpoint (P04-005)
- Any migration of existing data in the database

## Files Expected to Change

```
backend/src/models/FoodEntry.ts         (add fields + indexes)
backend/src/routes/logs.ts              (add deleted_at: null to GET queries)
```

## Architecture Constraints

- `D-INV-01`: entries are never hard-deleted — only `deleted_at` is set
- Idempotency key index must be sparse (null values are valid and common)

## Acceptance Criteria

1. FoodEntry schema has all four new fields with correct types
2. `idempotency_key` has a unique sparse index
3. Existing GET /api/logs query includes `{ deleted_at: null }` filter
4. Build passes

## Edge Cases

- Existing FoodEntry documents in DB have no `deleted_at` field — MongoDB treats missing fields as null for queries with `{ deleted_at: null }`, so existing documents will still appear in query results

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Read data-architecture.md for the complete schema. Add only the four new fields — do not touch existing fields. After adding, grep for all FoodEntry queries in the codebase and add `deleted_at: null` filter to each. Build.
