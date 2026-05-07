# Task Register

**Master index of all implementation tasks.**
Each task has a file at `.plan/implementation/tasks/{ID}-{slug}.md`.

Status legend: `NOT_STARTED` | `IN_PROGRESS` | `COMPLETE` | `BLOCKED`
Complexity: `S` (<1h) | `M` (1–3h) | `L` (3–6h) | `XL` (>6h)

---

## Phase 01 — Frontend Layout Foundation

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P01-001 | Home Screen Zone Scaffold | M | NOT_STARTED | — |
| P01-002 | Remove Tab Navigation | S | NOT_STARTED | P01-001 |
| P01-003 | TODAY Zone Structure | M | NOT_STARTED | P01-001 |
| P01-004 | LOG Zone Structure | S | NOT_STARTED | P01-001 |

## Phase 02 — Frontend Display Layer

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P02-001 | Typography System Application | M | NOT_STARTED | P01-001 |
| P02-002 | SIGNAL Hero Component (Static) | L | NOT_STARTED | P01-001 |
| P02-003 | Waveform Component (Static) | L | NOT_STARTED | P02-002 |
| P02-004 | Collapsed SIGNAL Strip | M | NOT_STARTED | P02-002 |
| P02-005 | Macro Rows in TODAY Zone | M | NOT_STARTED | P01-003 |

## Phase 03 — Command Bar Hardening

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P03-001 | Command Bar Focused State | M | NOT_STARTED | P01-001 |

## Phase 04 — Backend Data Layer

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P04-001 | User Document Schema | M | NOT_STARTED | — |
| P04-002 | FoodEntry Schema Update | M | NOT_STARTED | — |
| P04-003 | DayAggregate Schema | S | NOT_STARTED | P04-002 |
| P04-004 | DayAggregate Computation Service | M | NOT_STARTED | P04-003 |
| P04-005 | Write Pipeline Update | M | NOT_STARTED | P04-004 |
| P04-006 | GET /api/home Endpoint | M | NOT_STARTED | P04-005 |

## Phase 05 — Intelligence Engine (Tier 1+2)

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P05-001 | Tier 1 Computation Functions | L | NOT_STARTED | P04-004 |
| P05-002 | Tier 2 Computation Functions | XL | NOT_STARTED | P05-001 |
| P05-003 | SignalState + BaselineSnapshot Schemas | S | NOT_STARTED | P04-001 |
| P05-004 | SIGNAL Computation Orchestrator | L | NOT_STARTED | P05-002, P05-003 |
| P05-005 | SIGNAL Recompute Job | M | NOT_STARTED | P05-004 |

## Phase 06 — AI Synthesis (Tier 3)

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P06-001 | Tier 3 AI Synthesis Service | L | NOT_STARTED | P05-004 |
| P06-002 | AI Output Validation + Fallback | M | NOT_STARTED | P06-001 |
| P06-003 | POST /api/signal Route | M | NOT_STARTED | P06-002, P05-005 |
| P06-004 | Rate Limiting on /api/analyse | M | NOT_STARTED | — |

## Phase 07 — Frontend–Backend Integration

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P07-001 | Home Screen Data Hook | M | NOT_STARTED | P04-006 |
| P07-002 | SIGNAL Hero Connected to Real Data | M | NOT_STARTED | P07-001, P02-002 |
| P07-003 | Waveform Connected to Real Data | M | NOT_STARTED | P07-001, P02-003 |
| P07-004 | TODAY Zone Connected to Real Data | M | NOT_STARTED | P07-001, P02-005 |
| P07-005 | Waveform Day Selection | M | NOT_STARTED | P07-003, P07-004 |
| P07-006 | AI Instruction Display | S | NOT_STARTED | P07-004, P06-003 |

## Phase 08 — Motion System

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P08-001 | App Open Sequence | M | NOT_STARTED | P07-002 |
| P08-002 | Entry Card Arrival Animation | M | NOT_STARTED | P01-004 |
| P08-003 | Number Counting Animation | M | NOT_STARTED | P07-004 |
| P08-004 | Progress Bar Fill Animation | S | NOT_STARTED | P02-005 |
| P08-005 | Waveform Bar Rise Animation | M | NOT_STARTED | P07-003 |
| P08-006 | Card Expand/Collapse Animation | M | NOT_STARTED | P01-004 |

## Phase 09 — Onboarding Flow

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P09-001 | Onboarding State Detection | M | NOT_STARTED | P04-001 |
| P09-002 | Welcome Screen | M | NOT_STARTED | P09-001 |
| P09-003 | Goal Selection Screen | M | NOT_STARTED | P09-002 |
| P09-004 | Protein Target Screen | M | NOT_STARTED | P09-003 |
| P09-005 | Save Onboarding Data (Backend) | M | NOT_STARTED | P04-001 |
| P09-006 | Product Drop + READING State Display | M | NOT_STARTED | P09-004, P09-005, P07-002 |
| P09-007 | SIGNAL Activation + First-Time Explanation | L | NOT_STARTED | P09-006, P06-003 |

## Phase 10 — Observability & Hardening

| ID | Task | Complexity | Status | Depends On |
|---|---|---|---|---|
| P10-001 | Backend Structured Logging | M | NOT_STARTED | P04-005 |
| P10-002 | Frontend Error Boundaries | S | NOT_STARTED | P07-001 |
| P10-003 | Backend Input Validation (Zod) | M | NOT_STARTED | P04-005 |
| P10-004 | Security Headers + Prod Hardening | M | NOT_STARTED | P10-001 |

---

**Total tasks: 48**
**Complete: 0**
**In progress: 0**

*Update this register whenever task status changes. The task files are the source of detail; this register is the source of status.*
