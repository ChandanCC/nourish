# Phase 05 — Intelligence Engine (Tier 1+2)

**Status:** NOT_STARTED
**Tasks:** P05-001, P05-002, P05-003, P05-004, P05-005
**Estimated duration:** 8–12 hours

---

## Purpose

Implement the deterministic and statistical intelligence layers. After this phase, the system can compute SIGNAL state for any user without calling AI — using hard rules (Tier 1) and statistical algorithms (Tier 2). AI synthesis (Phase 06) is added on top.

This is the highest-complexity phase. Bugs here produce silent, incorrect intelligence. Read `engineering/intelligence-architecture.md` fully before starting any task.

---

## Prerequisites

- Phase 04 complete (DayAggregate data available, write pipeline updated)

---

## Exit Conditions (Phase Complete When)

1. Tier 1 functions correctly identify READING and UNDERFUELLED from fixture data
2. Tier 2 functions produce correct baseline, CV, slope, and candidate states from fixture data
3. SIGNAL orchestrator correctly chains Tier 1 → Tier 2 and returns the right state
4. SignalState and BaselineSnapshot documents are correctly written
5. SIGNAL recompute job is enqueued after every write
6. All Tier 1/2 functions have fixture-based verification

---

## Tasks

| Task | What it does |
|---|---|
| P05-001 | Implements Tier 1 functions: computeDailyTotals, computeDelta, safety state triggers |
| P05-002 | Implements Tier 2 functions: computeBaseline, computeCV, computePatternSlope, qualifyStateCandidates |
| P05-003 | Creates SignalState and BaselineSnapshot Mongoose models |
| P05-004 | Implements SIGNAL orchestrator: runs Tier 1 → Tier 2 → returns result or escalates to Tier 3 |
| P05-005 | Implements SIGNAL recompute async job (called from write pipeline) |

**Dependency order:** P05-001 → P05-002 → [P05-003 in parallel] → P05-004 → P05-005

---

## Architecture Constraints

- `engineering/intelligence-architecture.md` — ALL algorithms, thresholds, priority order
- `product/signal-states.md` — state definitions, trigger conditions, exact criteria
- `decisions/011-deterministic-signal-fallback.md` — fallback behavior
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-01` — AI receives pre-computed summary only
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-03` — deterministic computation precedes AI

---

## Critical Algorithms (Phase 05 owns these)

**Baseline computation (P05-002 — highest risk):**
```
Input: all logged days (with calories)
Step 1: Apply recency weighting: weight = exp(-0.04 × days_ago)
Step 2: Flag positive outliers: calories > mean + 2σ
Step 3: Flag negative outliers: calories < mean - 2.5σ (asymmetric)
Step 4: Compute weighted median of remaining days
Output: { baseline_kcal, established: logged_days >= 7, logged_days_used }
```

**DELTA calculation:**
```
DELTA = ((avg_logged_calories_7d - baseline_kcal) / baseline_kcal) × 100
Display: cap at ±50%, null if logged_days < 4 OR baseline not established
```

**Coefficient of variation:**
```
CV = stdDev(calories_7d) / mean(calories_7d)
DRIFTING trigger: CV > 0.25
```

**Candidate state qualification (P05-002):**
State pre-qualification criteria are defined in `product/signal-states.md`. The orchestrator passes only the qualified candidates to Tier 3. If READING or UNDERFUELLED trigger (Tier 1), stop — no candidates passed to Tier 3.

---

## Fixture-First Requirement

Before implementing any Tier 2 function, create fixture data at:
```
backend/src/services/intelligence/__tests__/
  tier1.test.ts
  tier2.test.ts
```

Minimum fixture scenarios for Tier 1:
- 2 logged days in last 14 → READING
- avg calories 5 days < baseline × 0.70, 3+ days logged → UNDERFUELLED
- Normal user, 7+ days → not READING, not UNDERFUELLED

Minimum fixture scenarios for Tier 2:
- 15 logged days, consistent 1800 kcal → baseline ~1800, established: true
- 7 logged days, one 3500 kcal outlier → outlier suppressed from baseline
- 7 days of wild variance → CV > 0.25, DRIFTING candidate

---

## What Exists After This Phase

- Complete Tier 1 and Tier 2 intelligence computation
- SIGNAL state computed from real data, all states except AI-gated ones work
- SignalState and BaselineSnapshot documents persisted
- SIGNAL recompute triggered after every write
- System degrades gracefully to READING/DRIFTING without AI
