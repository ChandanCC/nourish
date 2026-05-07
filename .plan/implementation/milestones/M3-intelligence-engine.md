# M3 — Intelligence Engine

**Phases:** 05, 06
**Tasks:** P05-001 through P05-005, P06-001 through P06-004
**Status:** NOT_STARTED

---

## Definition

The full SIGNAL computation pipeline works end-to-end: Tier 1 (deterministic), Tier 2 (statistical), and Tier 3 (AI synthesis) all produce correct results. All 7 SIGNAL states are producible.

## Milestone Complete When

1. Tier 1 READING and UNDERFUELLED trigger correctly from test fixtures
2. Tier 2 baseline, CV, slope computations pass all fixture tests
3. SIGNAL orchestrator chains Tier 1 → 2 → 3 correctly
4. SignalState and BaselineSnapshot persisted after each computation
5. AI output validated; fallback to Tier 1+2 result when AI fails
6. POST /api/signal returns a valid SignalState
7. SIGNAL recompute triggered after every food entry write
8. All Tier 1/2 fixture tests pass

## Validation

- Seed a test user with 8 days of consistent 1800 kcal entries
- Call POST /api/signal
- Confirm `state` is NOT "READING" (established baseline)
- Confirm `delta` is not null
- Seed another user with 1 logged day
- Call POST /api/signal
- Confirm `state` is "READING"

## Time Estimate

12–18 hours from Phase 05 start (highest-risk milestone).
