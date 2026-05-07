# P08-004 — Progress Bar Fill Animation

**Phase:** 08 — Motion System
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P02-005
**Unlocks:** (motion complete)

---

## Purpose

Animate macro progress bars filling from 0% to their target width on mount.

## Why It Exists

The fill animation communicates data settling into position. From `design-system/motion-system.md`.

## Required Reading

- `design-system/motion-system.md#progress-bar-fill` — duration and easing spec

## Exact Scope

- In `MacroRow.tsx`: add CSS transition to the progress bar fill element
- Initial width on mount: `0%`
- After mount: transition to the computed `(current / target) × 100%`
- Duration: 500ms, ease-out
- Use `useEffect` to trigger the width change after mount

## Design-System Constraints

- Duration: 500ms
- Easing: ease-out
- No spring, no bounce
- Transition applies to `width` property only

## Acceptance Criteria

1. Progress bars animate from 0% to their filled position on mount
2. Animation duration is approximately 500ms
3. If target is null, bar stays at 0% (no animation)
4. Build passes

## Estimated Complexity

S — <1 hour.

## Claude Execution Guidance

Add `transition: width 500ms ease-out` to the fill element CSS. Use a `mounted` state: initial width is `0%`, useEffect sets it to the real width. The CSS transition handles the animation.
