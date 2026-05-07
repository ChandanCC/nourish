# Phase 07 — Frontend–Backend Integration

**Status:** NOT_STARTED
**Tasks:** P07-001, P07-002, P07-003, P07-004, P07-005, P07-006
**Estimated duration:** 5–7 hours

---

## Purpose

Wire all static display components (built in Phase 02) to real backend data (built in Phases 04–06). After this phase, the app shows real nutrition data, real SIGNAL state, and real waveform from the user's actual food logs.

---

## Prerequisites

- Phase 02 complete (static components exist with correct props interfaces)
- Phase 04 complete (GET /api/home returns real data)
- Phase 06 complete (POST /api/signal returns full state)

---

## Exit Conditions (Phase Complete When)

1. Home screen renders with real today's macro data from GET /api/home
2. SIGNAL hero displays the real state from the backend (not hardcoded "READING")
3. Waveform shows the last 7 days from real DayAggregate data
4. TODAY zone shows real macro progress bars against user's targets
5. Waveform day selection updates TODAY zone to show that day's data
6. AI instruction text renders when present in SIGNAL state
7. All loading states are minimal: no skeleton screens, no spinners on initial load (see I-INV notes)
8. `npm run build -w frontend` passes with 0 errors

---

## Tasks

| Task | What it does |
|---|---|
| P07-001 | Creates useHomeScreen data hook (TanStack Query, GET /api/home) |
| P07-002 | Wires SignalHero to real state + delta from hook |
| P07-003 | Wires Waveform to real waveform days from hook |
| P07-004 | Wires TODAY zone macro rows to real today data from hook |
| P07-005 | Implements waveform day selection + TODAY zone updates for selected day |
| P07-006 | Adds AI instruction display to TODAY zone |

**Dependency order:** P07-001 first. P07-002, P07-003, P07-004 parallel after. P07-005 after P07-003 + P07-004. P07-006 after P07-004.

---

## Architecture Constraints

- `engineering/backend-architecture.md` — HomeScreenPayload type (must match exactly)
- `architecture/ARCHITECTURE_INVARIANTS.md#U-INV-01` — home screen load must be < 500ms
- `architecture/ARCHITECTURE_INVARIANTS.md#U-INV-02` — no content flash on initial load
- No Zustand. TanStack Query is the only state management. No prop drilling beyond 2 levels.

---

## Data Hook Design (P07-001)

```typescript
// useHomeScreen.ts
function useHomeScreen() {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => fetchHomeScreen(),
    staleTime: 30_000,      // 30s
    refetchOnWindowFocus: true,
  });
}
```

The hook returns `HomeScreenPayload | undefined`. Components receive props from the page-level component that holds the hook — not from nested hooks.

---

## Loading State Rules

- Do not render skeleton screens or placeholder shimmer effects.
- If data is loading on first mount: render empty zones (no content).
- If data fetch fails: render the same empty zones (no error toasts, no retry UI).
- Stale data is shown immediately on re-focus; background refetch does not flash.

---

## Waveform Day Selection (P07-005)

Selecting a waveform bar does NOT trigger a new API call. The full 7-day payload is in the initial HomeScreenPayload. Day selection is local state that filters the existing payload.

```typescript
const [selectedDayIndex, setSelectedDayIndex] = useState(6); // today = last
```

The TODAY zone displays the data for the selected day index from `waveform[selectedDayIndex]`.

---

## Idempotency Key (P07-001 note)

The POST /api/logs submit must include an idempotency key (UUID v4). Generate it at submit time in the existing command bar submit handler. Add as `X-Idempotency-Key` header.

---

## What Exists After This Phase

- Home screen is fully live with real data
- SIGNAL state, waveform, macro rows all driven by backend
- Day selection works without extra API calls
- AI instruction displayed when present
- App is functionally complete for logged users
