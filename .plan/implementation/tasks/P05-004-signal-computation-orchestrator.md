# P05-004 — SIGNAL Computation Orchestrator

**Phase:** 05 — Intelligence Engine
**Complexity:** L (3–6h)
**Status:** NOT_STARTED
**Depends on:** P05-002, P05-003
**Unlocks:** P05-005, P06-001

---

## Purpose

Implement the SIGNAL orchestrator that chains Tier 1 → Tier 2 → escalates to Tier 3. Persists SignalState and BaselineSnapshot documents.

## Why It Exists

The orchestrator is the entry point for all SIGNAL computation. It loads data, runs Tier 1/2 in sequence, decides whether to escalate to Tier 3, and writes results. Every other part of the intelligence system calls through this orchestrator.

## Required Reading

- `engineering/intelligence-architecture.md#orchestrator` — chaining logic, escalation rules
- `decisions/011-deterministic-signal-fallback.md` — fallback behavior
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-03` — Tier 1+2 always run before Tier 3

## Exact Scope

Create `backend/src/services/intelligence/orchestrator.ts`:

```typescript
interface SIGNALComputeResult {
  state: string;
  subtitle: string | null;
  delta: string | null;
  patternQualifier: string | null;
  aiInstruction: string | null;
  tier: 1 | 2 | 3;           // which tier produced the result
  candidates: string[];       // state candidates passed to Tier 3 (empty if Tier 1 triggered)
}

async function computeSIGNAL(userId: string): Promise<SIGNALComputeResult>
```

**Orchestration logic:**
1. Load last 90 days of DayAggregate for userId
2. Run Tier 1: `isReading()`, `isUnderfuelled()`
3. If Tier 1 triggers: persist SignalState with that state, return `{ tier: 1, candidates: [] }`
4. Run Tier 2: `computeBaseline()`, `computeCV()`, `computePatternSlope()`, `qualifyStateCandidates()`
5. Persist BaselineSnapshot
6. If zero candidates: return `{ state: "DRIFTING", tier: 2, candidates: [] }` (default fallback)
7. If candidates exist: set `is_stale: true` on SignalState and return candidates for Tier 3 (P06-001 handles this step)
8. Persist SignalState with Tier 2 result

## Out of Scope

- Tier 3 call (P06-001) — the orchestrator leaves an escalation hook; Tier 3 is added in Phase 06
- SIGNAL recompute job (P05-005)

## Files Expected to Change

```
backend/src/services/intelligence/orchestrator.ts   (new)
```

## Architecture Constraints

- `I-INV-03`: Tier 1+2 always run; Tier 3 is escalated to, never bypasses Tier 1+2
- `I-INV-01`: orchestrator does NOT pass raw FoodEntry data to Tier 3 — only the pre-computed summary
- Tier 1 short-circuits: if READING or UNDERFUELLED trigger, Tier 2 still runs for BaselineSnapshot (but the state is fixed)
- Fallback if Tier 3 not yet implemented: use the first candidate from `qualifyStateCandidates`

## Acceptance Criteria

1. If READING triggers: SignalState is written with state="READING"
2. If UNDERFUELLED triggers: SignalState is written with state="UNDERFUELLED"
3. If Tier 1 does not trigger: Tier 2 runs and BaselineSnapshot is updated
4. If candidates are empty after Tier 2: state defaults to "DRIFTING"
5. BaselineSnapshot is always updated when Tier 2 runs
6. Build passes

## Edge Cases

- User has no DayAggregate data → READING (zero logged days triggers Tier 1 isReading)
- computeBaseline returns established:false but candidates are still computed correctly based on available data

## Estimated Complexity

L — ~3 hours.

## Claude Execution Guidance

Build the orchestrator as a sequential pipeline. Load data first, then run Tier 1, then Tier 2. Use early returns for Tier 1 triggers. Log each step with the requestId for observability (added in P10-001, but structure logs now). Keep the Tier 3 escalation as a clear extension point — a TODO comment with the expected function signature is sufficient for now.
