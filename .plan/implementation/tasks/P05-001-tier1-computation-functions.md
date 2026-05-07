# P05-001 — Tier 1 Computation Functions

**Phase:** 05 — Intelligence Engine
**Complexity:** L (3–6h)
**Status:** NOT_STARTED
**Depends on:** P04-004
**Unlocks:** P05-002

---

## Purpose

Implement Tier 1 deterministic functions: `computeDailyTotals`, `computeDelta`, and the two safety state triggers (READING, UNDERFUELLED).

## Why It Exists

Tier 1 is the foundation of the intelligence engine. It runs before Tier 2 and Tier 3. If Tier 1 triggers a state, computation stops — no AI call is made. These functions must be correct before Tier 2 is built on top of them.

## Required Reading

- `engineering/intelligence-architecture.md#tier1` — algorithm definitions
- `product/signal-states.md#READING` and `#UNDERFUELLED` — trigger conditions
- Phase 05 phase file: `phases/phase-05-intelligence.md` — fixture scenarios

## Exact Scope

Create `backend/src/services/intelligence/tier1.ts` with:

```typescript
// Returns aggregated totals from DayAggregate array
function computeDailyTotals(days: DayAggregate[]): DailyTotals

// Returns DELTA: ((avg7d - baseline) / baseline) * 100
// Returns null if logged_days < 4 OR baseline not established
function computeDelta(days: DayAggregate[], baseline: BaselineResult): number | null

// Returns true if fewer than 2 logged days (entry_count > 0) in last 14 days
function isReading(days: DayAggregate[]): boolean

// Returns true if avg calories 5+ consecutive days < baseline * 0.70 AND 3+ days logged
function isUnderfuelled(days: DayAggregate[], baseline: BaselineResult): boolean
```

Create `backend/src/services/intelligence/__tests__/tier1.test.ts` with fixture scenarios:
- 2 logged days in last 14 → `isReading()` returns true
- avg calories 5 days < baseline × 0.70, 3+ logged days → `isUnderfuelled()` returns true
- Normal user, 7+ days → neither triggers

## Out of Scope

- Tier 2 functions (P05-002)
- SIGNAL orchestrator (P05-004)
- Any database reads (these are pure functions operating on pre-loaded data)

## Files Expected to Change

```
backend/src/services/intelligence/tier1.ts          (new)
backend/src/services/intelligence/__tests__/tier1.test.ts  (new)
backend/src/services/intelligence/types.ts          (new — shared types)
```

## Architecture Constraints

- All Tier 1 functions are pure — no DB calls, no side effects
- Input: arrays of DayAggregate objects (already loaded by the orchestrator)
- `isReading()` checks 14-day window, not 7-day
- `isUnderfuelled()`: "5+ consecutive days" means the most recent 5 days, not any 5-day window

## Acceptance Criteria

1. `isReading()` returns true when < 2 logged days (entry_count > 0) in last 14 days
2. `isUnderfuelled()` returns true when avg calories of most recent 5 days < baseline * 0.70 AND 3+ of those days have entries
3. `computeDelta()` returns null if fewer than 4 logged days
4. `computeDelta()` returns null if `baseline.established = false`
5. All fixture tests in tier1.test.ts pass

## Edge Cases

- Empty days array → `isReading()` returns true (no data = READING)
- `baseline.established = false` → `isUnderfuelled()` returns false (can't evaluate without baseline)

## Estimated Complexity

L — ~3 hours including fixture tests.

## Claude Execution Guidance

Write the test fixtures FIRST before implementing any function. The fixture defines the expected behavior. Implement against the fixtures. Keep all functions as pure TypeScript — no Mongoose imports in this file.
