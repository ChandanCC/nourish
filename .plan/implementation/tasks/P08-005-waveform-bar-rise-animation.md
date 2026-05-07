# P08-005 — Waveform Bar Rise Animation

**Phase:** 08 — Motion System
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-003
**Unlocks:** (motion complete)

---

## Purpose

Animate waveform bars rising from 0 to their full height on initial load, with a 30ms stagger between bars.

## Why It Exists

The waveform rise animation communicates that historical data is loading and settling. It gives the visualization a sense of the data appearing from nothing. From `design-system/motion-system.md`.

## Required Reading

- `design-system/motion-system.md#waveform-rise` — timing, stagger, easing

## Exact Scope

- Each bar in `Waveform.tsx` starts at height `0`
- After mount: transition to its computed height
- Duration: 300ms per bar, ease-out
- Stagger: 30ms delay per bar index (bar 0: 0ms, bar 6: 180ms)
- Apply stagger via inline `transitionDelay` on each bar

## Design-System Constraints

- Duration: 300ms
- Stagger: 30ms
- Easing: ease-out
- Runs once on mount

## Acceptance Criteria

1. Bars rise from 0 on initial data load
2. Stagger is visible — earlier bars lead the rise
3. Animation runs once on mount
4. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Similar to P08-004: use `mounted` state. Initial bar height is `0`. After `useEffect`, set heights to real values. Add CSS `transition: height 300ms ease-out` to each bar. Set inline `transitionDelay: ${index * 30}ms`.
