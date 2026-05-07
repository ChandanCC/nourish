# P07-003 — Waveform Connected to Real Data

**Phase:** 07 — Frontend–Backend Integration
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-001, P02-003
**Unlocks:** P07-005, P08-005

---

## Purpose

Wire the `Waveform` component to receive real waveform data from the `useHomeScreen` hook.

## Why It Exists

The Waveform was built with static mock data in P02-003. This task replaces mock data with the real 7-day waveform from the home screen payload.

## Exact Scope

- In `SignalZone.tsx`: extract `waveform` and `today` fields from `useHomeScreen()` data
- Derive the `baseline` value from the `SignalState` or BaselineSnapshot (if available in payload; otherwise compute a rough average from waveform data as fallback)
- Pass waveform data to `Waveform`:
  ```typescript
  <Waveform
    days={waveformDays}          // mapped from HomeScreenPayload.waveform
    selectedDay={selectedDayIndex}
    baseline={baselineKcal}
    onDaySelect={setSelectedDayIndex}
  />
  ```
- Map `HomeScreenPayload.waveform` (WaveformDay from backend) to the component's expected format

## Out of Scope

- Day selection updating TODAY zone (P07-005)
- Animation (P08-005)

## Files Expected to Change

```
frontend/src/components/SignalZone.tsx  (pass real waveform data to Waveform)
```

## Architecture Constraints

- `WaveformDay` from backend has `{ date, calories, entryCount }` — the component expects `{ calories, isToday, label }`. Map at the zone level, not inside the component.
- `isToday`: true if the day's `date` matches today's ISO date
- `label`: derive single-letter day from the ISO date string

## Acceptance Criteria

1. Waveform renders real 7-day data from the backend
2. Today's bar is correctly identified and uses `--wave-today` color
3. Bars above/below baseline use correct wave tokens
4. Build passes

## Edge Cases

- Fewer than 7 days of data (new user) → fill missing days with `calories: 0, isToday: false`

## Estimated Complexity

M — ~1.5 hours. Mostly data mapping.

## Claude Execution Guidance

The main work is the mapping function: `HomeScreenPayload.waveform[] → WaveformProps.days[]`. Write a pure mapping function (not inside a component render) that transforms the backend type to the component type.
