# P04-006 — GET /api/home Endpoint

**Phase:** 04 — Backend Data Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-005
**Unlocks:** P07-001

---

## Purpose

Implement `GET /api/home` which returns the full `HomeScreenPayload`: today's macro data, last 7 days waveform data, SIGNAL placeholder, and user targets.

## Why It Exists

This is the primary API endpoint for the home screen. Phase 07 wires the frontend directly to this endpoint. The payload must be complete and correctly typed before the integration work begins.

## Required Reading

- `engineering/backend-architecture.md#HomeScreenPayload` — canonical type definition
- `engineering/data-architecture.md` — DayAggregate and User schemas

## Exact Scope

- Create `GET /api/home` route (or update if it exists as a stub)
- Query sources:
  - `today` data: `DayAggregate.findOne({ userId, date: todayUTC })`
  - `waveform` data: `DayAggregate.find({ userId, date: { $gte: sevenDaysAgoUTC } }).sort({ date: 1 }).limit(7)`
  - `targets`: from `User.findById(userId)` — `goal`, `protein_target`
  - `signal`: read from `SignalState.findOne({ userId })` if exists; otherwise return `READING` placeholder
- Build and return `HomeScreenPayload`

## HomeScreenPayload Type

```typescript
interface HomeScreenPayload {
  today: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    entryCount: number;
    targets: {
      calories: number | null;
      protein: number;
    };
  };
  signal: {
    state: string;
    subtitle: string | null;
    delta: string | null;
    patternQualifier: string | null;
    aiInstruction: string | null;
    isStale: boolean;
  };
  waveform: WaveformDay[];
  userId: string;
}
interface WaveformDay {
  date: string;
  calories: number;
  entryCount: number;
}
```

## Out of Scope

- SIGNAL state computation (Phase 05/06) — return `{ state: "READING", ... nulls, isStale: false }` placeholder if no SignalState exists
- Any frontend changes

## Files Expected to Change

```
backend/src/routes/home.ts              (new, or update existing)
backend/src/app.ts or routes/index.ts   (register the route)
```

## Architecture Constraints

- `D-INV-04`: all queries include userId from JWT middleware
- Date arithmetic: use UTC consistently — `new Date().toISOString().slice(0, 10)` for today's date string
- If today's DayAggregate doesn't exist yet: return zeros for all macro fields

## Acceptance Criteria

1. `GET /api/home` with valid JWT returns a valid HomeScreenPayload
2. `today` fields reflect the current day's DayAggregate (or zeros if no entries)
3. `waveform` array has up to 7 entries (fewer if user is new)
4. `targets.calories` is null if user has no goal set
5. `signal.state` is "READING" if no SignalState document exists
6. Response time < 200ms under normal load
7. Build passes

## Edge Cases

- New user with no DayAggregate data → `waveform: []`, `today: { all zeros }`
- User with no User document → return 401 (auth middleware should catch this)

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Run all three DB queries in parallel: `Promise.all([getDayAggregate, getWaveform, getUser, getSignalState])`. Build the response object from the results. Handle null DayAggregate gracefully (default to zeros). The SIGNAL section is a passthrough from SignalState if it exists, or a hardcoded READING placeholder.
