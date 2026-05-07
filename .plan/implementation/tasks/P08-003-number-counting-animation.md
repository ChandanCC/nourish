# P08-003 — Number Counting Animation

**Phase:** 08 — Motion System
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-004
**Unlocks:** (motion complete)

---

## Purpose

Animate macro total numbers counting up from 0 to their final value when data loads.

## Why It Exists

The number counting animation communicates that values have been loaded and settled. It gives the data a sense of precision and weight. From `design-system/motion-system.md`.

## Required Reading

- `design-system/motion-system.md#number-counting` — duration and easing spec

## Exact Scope

- Create a `useCountUp(target: number, duration: number)` hook
- Returns the current animated value during the count-up
- Duration: 600ms, ease-out (cubic approximation)
- Triggers when `target` value changes from undefined (loading) to a real number
- Apply to: calories total, protein current, carbs current, fat current

## Design-System Constraints

- Duration: 600ms
- Easing: ease-out
- No spring, no bounce
- Numbers are integers (floor the animated value for display)

## Acceptance Criteria

1. Macro totals count up from 0 to actual value when data loads
2. Animation takes approximately 600ms
3. Numbers display as integers during animation (no decimals)
4. If data reloads with a new value, the count re-triggers from current displayed value
5. Build passes

## Edge Cases

- Target is 0: no animation needed (already at target)
- Target changes while animation is in progress: restart from current position

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Use `requestAnimationFrame` inside `useCountUp` with an easing function. Store the start time on first call. Each frame: `progress = (now - startTime) / duration`, clamp to [0,1], apply easing, compute current = start + (target - start) × easing(progress). Call `cancelAnimationFrame` on cleanup.
