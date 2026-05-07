# P05-002 — Tier 2 Computation Functions

**Phase:** 05 — Intelligence Engine
**Complexity:** XL (>6h)
**Status:** NOT_STARTED
**Depends on:** P05-001
**Unlocks:** P05-004

---

## Purpose

Implement Tier 2 statistical functions: `computeBaseline`, `computeCV`, `computePatternSlope`, and `qualifyStateCandidates`. These are the highest-complexity algorithms in the entire codebase.

## Why It Exists

Tier 2 produces the DELTA value, the baseline against which all pattern states are evaluated, and the list of state candidates passed to Tier 3. Bugs here produce silent, incorrect intelligence that users will trust. Fixture-first testing is mandatory.

## Required Reading

- `engineering/intelligence-architecture.md#tier2` — all algorithm specifications
- `product/signal-states.md` — all 7 state trigger conditions
- Phase 05 phase file: `phases/phase-05-intelligence.md` — baseline algorithm + fixture scenarios

## Exact Scope

Create `backend/src/services/intelligence/tier2.ts` with:

```typescript
interface BaselineResult {
  baseline_kcal: number;
  established: boolean;     // true when logged_days >= 7
  logged_days_used: number;
}

// Weighted median with recency weighting and outlier suppression
function computeBaseline(days: DayAggregate[]): BaselineResult

// CV = stdDev(calories_7d) / mean(calories_7d)
// Returns null if fewer than 3 days in last 7
function computeCV(days: DayAggregate[]): number | null

// Linear regression slope over calories in last 14 days
function computePatternSlope(days: DayAggregate[]): number | null

// Returns array of state names that meet their pre-qualification criteria
function qualifyStateCandidates(
  days: DayAggregate[],
  baseline: BaselineResult,
  delta: number | null,
  cv: number | null,
  slope: number | null
): string[]
```

**Baseline algorithm (exact):**
```
Input: all logged days (entry_count > 0), sorted by date
Step 1: Compute days_ago for each day
Step 2: weight = exp(-0.04 × days_ago)
Step 3: positive outlier threshold: mean + 2σ (flag if calories > threshold)
Step 4: negative outlier threshold: mean - 2.5σ (flag if calories < threshold)
Step 5: Compute weighted median of non-outlier days
Output: { baseline_kcal: weightedMedian, established: loggedDays >= 7, logged_days_used: loggedDays }
```

**Weighted median algorithm:**
Sort non-outlier days by calories. Find the value where cumulative weight >= 0.5 × total weight.

**CV trigger:**
- DRIFTING candidate if CV > 0.25

**Slope triggers:**
- CUTTING candidate if slope < -50 kcal/day (sustained downward trend)
- BUILDING candidate if slope > +50 kcal/day (sustained upward trend)

Create `backend/src/services/intelligence/__tests__/tier2.test.ts` with all fixture scenarios from phase-05.md:
- 15 consistent 1800 kcal days → baseline ~1800, established: true
- 7 days, one 3500 kcal outlier → outlier suppressed, baseline reflects the other 6
- 7 days of wild variance → CV > 0.25, DRIFTING in candidates

## Out of Scope

- SIGNAL orchestrator (P05-004)
- Any AI call

## Files Expected to Change

```
backend/src/services/intelligence/tier2.ts              (new)
backend/src/services/intelligence/__tests__/tier2.test.ts  (new)
backend/src/services/intelligence/types.ts              (update with Tier 2 types)
```

## Architecture Constraints

- All Tier 2 functions are pure — no DB calls
- Weighted median is not the same as weighted mean — implement correctly
- Outlier thresholds are asymmetric: +2σ positive, -2.5σ negative
- Baseline requires at least 3 logged days to compute (fewer → `{ baseline_kcal: 0, established: false, logged_days_used: 0 }`)

## Acceptance Criteria

1. All fixture tests in tier2.test.ts pass
2. 15-day consistent input produces `established: true`
3. Outlier suppression removes the 3500 kcal day from a 7-day set where others are ~1800
4. CV > 0.25 from high-variance data → DRIFTING in candidates
5. `qualifyStateCandidates` returns empty array when no criteria met
6. Build passes

## Edge Cases

- All days have same calories → CV = 0, no DRIFTING candidate
- Only 1 logged day → baseline not established, CV null, no candidates
- Negative slope strong enough → CUTTING candidate (check exact threshold in intelligence-architecture.md)

## Failure Cases

- Weighted median returns NaN → check for empty non-outlier array after outlier removal
- Division by zero in CV → check that mean > 0 before computing CV

## Estimated Complexity

XL — >6 hours. This is the most complex implementation task in the entire codebase.

## Claude Execution Guidance

Write all fixture tests BEFORE implementing any function. The weighted median algorithm is subtle — implement it separately and test it in isolation before using it inside computeBaseline. Do not use a statistics library — implement from spec. Read intelligence-architecture.md in full before starting.
