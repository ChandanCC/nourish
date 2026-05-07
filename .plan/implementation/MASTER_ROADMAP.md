# Master Roadmap

**Status:** Active — v1.1 implementation
**Last updated:** 2026-05-07

The canonical build order for Nouriq v1.1. Phases are sequential by default; some tasks within phases can be parallelized. See `DEPENDENCY_GRAPH.md` for the full dependency map.

---

## Implementation Philosophy

Build the visible before the intelligent. Build the intelligent before wiring them together. Build animations last.

**Rule:** A phase is not complete until every task in it is complete and passing its acceptance criteria. Do not start Phase N+1 while Phase N has outstanding tasks.

**Exception:** Phases 01–03 (frontend) and Phases 04–06 (backend) can proceed in parallel, as they have no dependencies between them until Phase 07 (integration).

---

## Phase Overview

```
PHASE 01 — Frontend Layout Foundation
  Purpose: Establish the four-zone home screen architecture
  Outputs: Zone scaffold, removed tab navigation
  Duration: 2 tasks parallelizable after P01-001
  Blocked by: Nothing

PHASE 02 — Frontend Display Layer  
  Purpose: All visual components rendered with static/mock data
  Outputs: SIGNAL hero, waveform, typography, macro rows
  Duration: 5 tasks, mostly parallelizable after P01-001
  Blocked by: Phase 01

PHASE 03 — Command Bar Hardening
  Purpose: Command bar focused state and interaction polish
  Outputs: Gold focus border, scrim, gradient fade
  Duration: 1 task
  Blocked by: Phase 01 (zone layout required)

PHASE 04 — Backend Data Layer
  Purpose: MongoDB schemas, write pipeline with DayAggregate
  Outputs: User model, updated FoodEntry, DayAggregate, GET /api/home
  Duration: 6 tasks sequential
  Blocked by: Nothing (parallel with Phase 01–03)

PHASE 05 — Intelligence Engine (Tier 1+2)
  Purpose: SIGNAL computation: deterministic + statistical layers
  Outputs: All Tier 1/2 functions, SIGNAL orchestrator, recompute job
  Duration: 5 tasks sequential
  Blocked by: Phase 04

PHASE 06 — AI Synthesis (Tier 3)
  Purpose: Claude integration for SIGNAL state synthesis
  Outputs: Tier 3 service, output validation, /api/signal route, rate limiting
  Duration: 4 tasks (P06-004 parallelizable)
  Blocked by: Phase 05

PHASE 07 — Frontend–Backend Integration
  Purpose: Wire all frontend components to real backend data
  Outputs: Live home screen with real SIGNAL data
  Duration: 6 tasks, sequential
  Blocked by: Phase 02, Phase 03, Phase 06

PHASE 08 — Motion System
  Purpose: All animations per motion-system spec
  Outputs: App open, entry arrival, numbers, progress bars, waveform
  Duration: 6 tasks, mostly parallelizable
  Blocked by: Phase 07 (components must be connected before animating)

PHASE 09 — Onboarding Flow
  Purpose: 3-screen setup + READING state + SIGNAL activation
  Outputs: Complete onboarding flow, product drop, activation sequence
  Duration: 7 tasks sequential
  Blocked by: Phase 07, Phase 06

PHASE 10 — Observability & Hardening
  Purpose: Logging, error handling, validation, security
  Outputs: Production-ready backend and frontend
  Duration: 4 tasks, mostly parallelizable
  Blocked by: Phase 07
```

---

## Critical Path

The minimum path from current state to shippable v1.1:

```
P01-001 → P01-002
       → P02-002 → P02-004
       → P02-003
       → P01-003 → P02-005
                 → P07-004 → P07-005 → P07-006

P04-001
P04-002 → P04-003 → P04-004 → P04-005 → P04-006
                                       → P05-001 → P05-002 → P05-004 → P05-005
                                                                       → P06-001 → P06-002 → P06-003
                                                            → P05-003

                                       [after P04-006 + P02-002 done] → P07-001 → P07-002
                                                                                 → P07-003
                                                                                 → P07-004

[after Phase 07] → P08-001 → P09-001 → P09-002 → P09-003 → P09-004 → P09-005 → P09-006 → P09-007
```

Longest chain: **P04-002 → P04-003 → P04-004 → P04-005 → P05-001 → P05-002 → P05-004 → P06-001 → P06-002 → P06-003 → P07-001 → P07-002 → P08-001 → P09-006 → P09-007**

This is the backend intelligence chain. It is the most complex and the most risky. Tackle it with full context.

---

## Parallelization Opportunities

Once Phase 01 (P01-001) is complete, these tracks can proceed simultaneously:

**Frontend Track A** (display):
P02-001, P02-002, P02-003, P02-004, P02-005 (limited parallelism — P02-004 depends on P02-002)

**Frontend Track B** (interaction):
P03-001, P01-002, P01-003, P01-004

**Backend Track** (data → intelligence → AI):
P04-001, P04-002 (parallel start) → P04-003 → P04-004 → P04-005 → ...

P06-004 (rate limiting) can be done any time — no dependencies.

---

## MVP Boundary

**v1.1 MVP** is achieved when:
- Phases 01–09 are complete
- A user can: complete onboarding → log food for 7 days → see SIGNAL activate with their real STATE
- The product feels like the spec

**MVP minimum:** Phases 01–07 + Phase 09 (without motion system). Motion is enhancement, not core functionality.

---

## Post-MVP Boundary (v1.2+)

The following are explicitly **not** in scope for v1.1:
- Training system (full set/rep/weight logging UI)
- Weekly SIGNAL report
- Barcode scanner
- Notification system (beyond day-14 permission prompt)
- Progressive overload detection
- Any `future/` item

Post-MVP work begins after v1.1 ships and is validated with real users.

---

## Recommended Build Order (Session Sequencing)

1. **Session 1:** P01-001, P01-002 (layout foundation) — ~2 hours
2. **Session 2:** P02-001, P02-002 (typography + SIGNAL hero static) — ~3 hours
3. **Session 3:** P02-003, P02-004, P02-005 (waveform, collapsed strip, macro rows) — ~4 hours
4. **Session 4:** P03-001, P01-003, P01-004 (command bar + zones) — ~3 hours
5. **Session 5:** P04-001, P04-002, P04-003 (backend schemas) — ~3 hours
6. **Session 6:** P04-004, P04-005, P04-006 (DayAggregate + write pipeline + home endpoint) — ~4 hours
7. **Session 7:** P05-001, P05-002 (Tier 1 + 2 computation) — ~5 hours
8. **Session 8:** P05-003, P05-004, P05-005 (schemas + orchestrator + job) — ~4 hours
9. **Session 9:** P06-001, P06-002, P06-003 (AI synthesis + validation + route) — ~4 hours
10. **Session 10:** P06-004, P07-001 (rate limiting + data hook) — ~2 hours
11. **Session 11:** P07-002, P07-003, P07-004 (frontend connected) — ~4 hours
12. **Session 12:** P07-005, P07-006 (day selection + AI instruction) — ~2 hours
13. **Session 13:** P08-001–P08-006 (motion system) — ~5 hours
14. **Session 14:** P09-001–P09-005 (onboarding core) — ~5 hours
15. **Session 15:** P09-006, P09-007 (product drop + activation) — ~3 hours
16. **Session 16:** P10-001–P10-004 (hardening) — ~4 hours

Total estimated: ~57 hours of focused implementation across 16 sessions.

---

## Milestone Map

| Milestone | Tasks Required | Description |
|---|---|---|
| M1: Visual Skeleton | P01-001 → P02-004 + P03-001 | Full home screen visually complete with static data |
| M2: Backend Ready | P04-001 → P06-003 | Backend can serve a complete home screen payload with real SIGNAL |
| M3: Living Product | P07-001 → P07-006 | Frontend wired to backend; product functions end-to-end |
| M4: Polished | P08-001 → P08-006 | Motion system complete; product feels finished |
| M5: Ship-Ready | P09-001 → P10-004 | Onboarding, hardening, and observability complete |

See `milestones/` directory for detailed milestone definitions.

---

*The roadmap is implementation-complete when Phase 10 is complete and M5 is reached.*
*Update this file when phase scope changes or new tasks are added.*
