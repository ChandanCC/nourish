# P07-005 — Waveform Day Selection

**Phase:** 07 — Frontend–Backend Integration
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-003, P07-004
**Unlocks:** (feature complete)

---

## Purpose

Implement waveform day selection: tapping a waveform bar updates the TODAY zone to show that day's nutrition data instead of today's.

## Why It Exists

Day selection is the primary navigation mechanism in the app. Users tap historical bars to review past days. It requires no new API call — all 7 days of data are in the initial payload.

## Required Reading

- Phase 07 phase file: `phases/phase-07-integration.md#waveform day selection` — local state approach

## Exact Scope

- Add `selectedDayIndex` state (default: 6 = today) in the parent component (HomeScreen or equivalent)
- Pass `onDaySelect` callback to `Waveform`
- When a bar is tapped, update `selectedDayIndex`
- Pass the selected day's data from `waveform[selectedDayIndex]` to `TodayZone` instead of always using `today`
- When `selectedDayIndex === 6` (today): use `HomeScreenPayload.today` for exact data
- When `selectedDayIndex < 6`: use `HomeScreenPayload.waveform[selectedDayIndex]` for that day (calories and entryCount only — macros breakdown not available for historical days)

## Out of Scope

- Historical macro breakdown by category (calories total only for historical days)
- New API calls for historical day data

## Files Expected to Change

```
frontend/src/pages/HomeScreen.tsx or App.tsx  (selectedDayIndex state)
frontend/src/components/Waveform.tsx          (call onDaySelect on bar tap)
frontend/src/components/TodayZone.tsx         (accept optional historical day data)
```

## Architecture Constraints

- No API call on day selection — all data is already in the payload
- Historical days only have `calories` and `entryCount` — macro rows for protein/carbs/fat are hidden or show "—" for historical days

## Acceptance Criteria

1. Tapping a waveform bar highlights that bar as selected
2. TODAY zone updates to show the selected day's calorie total
3. Macro breakdown rows are hidden or show "—" for historical days (not today)
4. Tapping today's bar restores today's full data
5. Selected bar is visually distinct (per waveform.md spec)
6. Build passes

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Add `useState(6)` at the parent level. Pass the index down to Waveform as `selectedDay` and the callback as `onDaySelect`. In TodayZone, accept a `selectedDay` prop of type `WaveformDay | TodayData` (the selected entry from payload) and render differently based on whether it's today or a historical day.
