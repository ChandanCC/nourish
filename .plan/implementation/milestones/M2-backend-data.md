# M2 — Backend Data Layer

**Phases:** 04
**Tasks:** P04-001 through P04-006
**Status:** NOT_STARTED

---

## Definition

The backend correctly stores, computes, and serves real nutrition data. GET /api/home returns correct macro totals for a real user.

## Milestone Complete When

1. User document created on first login
2. FoodEntry supports soft-delete, meal_label, idempotency_key
3. DayAggregate recomputed on every write
4. GET /api/home returns real today's data
5. All MongoDB indexes exist
6. `npm run build -w backend` passes

## Validation

- Log a food entry via POST /api/logs
- Call GET /api/home
- Confirm `today.calories` matches the logged entry's calories
- Delete the entry via DELETE /api/logs/:id
- Call GET /api/home again
- Confirm `today.calories` returns to 0

## Time Estimate

6–9 hours from Phase 04 start.
