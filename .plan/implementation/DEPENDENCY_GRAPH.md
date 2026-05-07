# Dependency Graph

**Last updated:** 2026-05-07

Full dependency map for all 46 tasks. Use this to understand what must be done before starting any task, and what becomes unblocked after completing it.

---

## Visual Graph (Critical Path Highlighted)

```
                   ┌──────────┐
                   │ P01-001  │  Home Screen Zone Scaffold  ◄── START HERE
                   └────┬─────┘
         ┌──────────────┼──────────────────────┐
         │              │                      │
    ┌────▼────┐   ┌─────▼────┐          ┌─────▼────┐
    │ P01-002 │   │ P01-003  │          │ P01-004  │
    │ Remove  │   │  TODAY   │          │   LOG    │
    │  Tabs   │   │  Zone    │          │  Zone    │
    └─────────┘   └────┬─────┘          └────┬─────┘
                       │                     │
                  ┌────▼────┐          ┌─────▼─────┐
                  │ P02-005 │          │  P08-002  │
                  │  Macro  │          │  P08-006  │
                  │  Rows   │          │  (motion) │
                  └────┬────┘          └───────────┘
                       │
                 ┌─────▼──────┐
    ┌──────────► │  P07-004   │
    │            │ TODAY Zone │
    │            │ Real Data  │
    │            └──────┬─────┘
    │                   │
    │            ┌──────▼─────┐
    │            │  P07-005   │  Day Selection
    │            └──────┬─────┘
    │                   │
    │            ┌──────▼─────┐
    │            │  P07-006   │  AI Instruction
    │            └────────────┘
    │
    │   ┌──────────┐
    │   │ P01-001  │  (also unlocks)
    │   └──────┬───┘
    │          │
    │   ┌──────▼───┐
    │   │ P02-001  │  Typography
    │   └──────────┘
    │
    │   ┌──────────┐          ┌──────────┐
    │   │ P02-002  │          │ P02-003  │
    │   │  SIGNAL  │          │ Waveform │
    │   │  Hero    │          │ (Static) │
    │   └────┬─────┘          └────┬─────┘
    │        │                     │
    │   ┌────▼─────┐         ┌─────▼─────┐
    │   │ P02-004  │         │  P07-003  │ ◄───────────────┐
    │   │ Collapsed│         │ Waveform  │                 │
    │   │  Strip   │         │ Real Data │                 │
    │   └──────────┘         └─────┬─────┘                 │
    │                              │                       │
    │                        ┌─────▼─────┐                 │
    │                        │  P08-005  │                 │
    │                        │ Waveform  │                 │
    │                        │ Rise Anim │                 │
    │                        └───────────┘                 │
    │                                                      │
    │   ┌──────────┐                                       │
    │   │ P07-001  │  Home Screen Data Hook ◄──────────────┼───────┐
    │   └────┬─────┘                                       │       │
    │        ├─────────────────────────────────────────────┘       │
    │        │                                                      │
    │   ┌────▼─────┐                                               │
    └───┤  P07-002  │  SIGNAL Hero Real Data ─► P08-001 ─► P09-006│
        └──────────┘                                               │
                                                                   │
═══════════════════════════════════════════════════════════════════╪═══
BACKEND TRACK (parallel with frontend until Phase 07)             │
═══════════════════════════════════════════════════════════════════╪═══
                                                                   │
┌──────────┐  ┌──────────┐                                        │
│ P04-001  │  │ P04-002  │  (parallel start)                      │
│  User    │  │ FoodEntry│                                        │
│ Schema   │  │ Schema   │                                        │
└────┬─────┘  └────┬─────┘                                        │
     │              │                                              │
     │         ┌────▼─────┐                                       │
     │         │ P04-003  │  DayAggregate Schema                  │
     │         └────┬─────┘                                       │
     │              │                                              │
     │         ┌────▼─────┐                                       │
     │         │ P04-004  │  DayAggregate Compute Service         │
     │         └────┬─────┘                                       │
     │              │                                              │
     │         ┌────▼─────┐                                       │
     │         │ P04-005  │  Write Pipeline Update                │
     │         └────┬─────┘                                       │
     │         ┌────▼─────┐                                       │
     │         │ P04-006  │  GET /api/home ──────────────────────►│ (feeds P07-001)
     │         └────┬─────┘                                       │
     │              │                                              │
     │         ┌────▼─────┐                                       │
     │         │ P05-001  │  Tier 1 Computation                   │
     │         └────┬─────┘                                       │
     │              │                                              │
     │         ┌────▼─────┐                                       │
     │         │ P05-002  │  Tier 2 Computation  ◄── HIGHEST RISK │
     │         └────┬─────┘                                       │
     │     ┌────────┴───────┐                                     │
     │     │                │                                     │
     │ ┌───▼────┐      ┌────▼─────┐                               │
     └─► P05-003│      │ P05-004  │  SIGNAL Orchestrator          │
       │ Schemas│      └────┬─────┘                               │
       └────────┘           │                                     │
                       ┌────▼─────┐                               │
                       │ P05-005  │  Recompute Job                │
                       └────┬─────┘                               │
                            │                                     │
                       ┌────▼─────┐                               │
                       │ P06-001  │  Tier 3 AI Synthesis          │
                       └────┬─────┘                               │
                            │                                     │
                       ┌────▼─────┐                               │
                       │ P06-002  │  Validation + Fallback        │
                       └────┬─────┘                               │
                            │                                     │
                       ┌────▼─────┐                               │
                       │ P06-003  │  /api/signal Route ───────────┘
                       └──────────┘

P06-004 (rate limiting) — independent, no deps, any time after P04-005
P10-001–P10-004 — after Phase 07 complete
```

---

## Dependency Table (Forward)

Each row shows what a task UNLOCKS when complete:

| Complete | Unlocks |
|---|---|
| P01-001 | P01-002, P01-003, P01-004, P02-001, P02-002, P02-003, P03-001 |
| P01-002 | (nothing — terminal) |
| P01-003 | P02-005 |
| P01-004 | P08-002, P08-006 |
| P02-001 | (nothing — terminal, applies to all components) |
| P02-002 | P02-004, P07-002 (with P07-001) |
| P02-003 | P07-003 (with P07-001) |
| P02-004 | P08-001 (with P07-002) |
| P02-005 | P07-004 (with P07-001), P08-004 |
| P03-001 | (nothing — terminal) |
| P04-001 | P05-003, P09-001, P09-005 |
| P04-002 | P04-003 |
| P04-003 | P04-004 |
| P04-004 | P04-005 |
| P04-005 | P04-006, P05-001, P10-001, P10-003 |
| P04-006 | P07-001 |
| P05-001 | P05-002 |
| P05-002 | P05-004 |
| P05-003 | P05-004 (with P05-002) |
| P05-004 | P05-005, P06-001 |
| P05-005 | P06-003 (with P06-002) |
| P06-001 | P06-002 |
| P06-002 | P06-003 (with P05-005) |
| P06-003 | P07-006 (with P07-004), P09-007 |
| P06-004 | (nothing — terminal) |
| P07-001 | P07-002, P07-003, P07-004 |
| P07-002 | P08-001, P09-006 (with P09-005, P09-004) |
| P07-003 | P07-005 (with P07-004), P08-005 |
| P07-004 | P07-005 (with P07-003), P07-006 (with P06-003), P08-003 |
| P07-005 | P08-005 (refinement) |
| P07-006 | (nothing — terminal) |
| P08-001–P08-006 | (all terminal — motion system complete) |
| P09-001 | P09-002 |
| P09-002 | P09-003 |
| P09-003 | P09-004 |
| P09-004 | P09-006 (with P09-005, P07-002) |
| P09-005 | P09-006 (with P09-004, P07-002) |
| P09-006 | P09-007 (with P06-003) |
| P09-007 | M5 (ship-ready milestone) |
| P10-001–P10-004 | (all terminal) |

---

## Risky Sequences

### Backend Intelligence Chain (Highest Risk)
`P05-001 → P05-002 → P05-004 → P06-001 → P06-002 → P06-003`

**Risk:** This chain implements the core product intelligence. Bugs here are silent and hard to detect. Each function must be tested with fixtures before the next depends on it.

**Mitigation:** Write computation functions with test fixtures first (a set of known inputs → expected outputs). Do not chain calls until each function is independently verified.

---

### Baseline Algorithm (Second Highest Risk)
`P05-002` — Tier 2: weighted median with exponential decay

**Risk:** The baseline is the denominator for DELTA and the reference for all SIGNAL states. An incorrect baseline produces incorrect DELTA, which produces incorrect STATE. The error is silent — the system will run and produce a plausible-looking wrong answer.

**Mitigation:** Test with real-looking fixture data before integration. Verify: outlier suppression removes correct days, recency weighting is applied correctly, the weighted median (not mean) is computed.

---

### Frontend–Backend State Contract (Medium Risk)
`P04-006 → P07-001` — HomeScreenPayload shape

**Risk:** If the API contract and the frontend type don't match, integration will fail silently (TypeScript `any`) or loudly (runtime error). The HomeScreenPayload type must be defined identically in backend and frontend.

**Mitigation:** Define `HomeScreenPayload` as a shared type. Export from backend, import in frontend, or define identically in both. Verify the shape in P04-006 before P07-001 consumes it.

---

### Onboarding State + SIGNAL Dependency
`P09-006` — depends on P09-004 (onboarding data saved) AND P07-002 (SIGNAL hero wired)

**Risk:** READING state display requires the SIGNAL hero to be connected AND the user's onboarding data (goal, protein target) to be saved. If either is incomplete, READING looks wrong or crashes.

**Mitigation:** Complete both P07-002 and P09-005 before starting P09-006. Verify with a test user that has completed onboarding but has zero food logs.

---

## Parallelizable Work

These task pairs/groups can be done in the same session or by separate contexts simultaneously:

| Group | Tasks | Notes |
|---|---|---|
| Frontend layout tracks | P01-003, P01-004, P02-001 | After P01-001 |
| Backend schema pair | P04-001, P04-002 | No dependencies between them |
| Rate limiting | P06-004 | Anytime after P04-005 |
| Motion system | P08-002, P08-003, P08-004, P08-006 | After respective component tasks |
| Hardening | P10-001, P10-002, P10-003, P10-004 | After Phase 07 |

---

## Architectural Deadlock Prevention

These task orderings would create unresolvable conflicts if violated:

1. **Never** start P07-001 (data hook) before P04-006 (/api/home) is complete. The TypeScript type would be missing or guessed incorrectly.

2. **Never** start P06-001 (AI synthesis) before P05-002 (Tier 2) is complete. AI receives a summary object from Tier 2; without Tier 2, the object shape is unknown.

3. **Never** start P09-007 (SIGNAL activation display) before P06-003 (/api/signal route) is complete. The activation display requires the real SIGNAL state from the backend.

4. **Never** start motion system tasks (Phase 08) before the corresponding component is connected to real data (Phase 07). Animating placeholder/mock data wastes effort — the animation parameters may change when real data has different ranges.

---

*This graph is the planning contract. Deviating from it requires an explicit justification logged in PROGRESS.md.*
