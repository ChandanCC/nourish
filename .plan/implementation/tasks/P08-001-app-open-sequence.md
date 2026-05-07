# P08-001 — App Open Sequence

**Phase:** 08 — Motion System
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-002
**Unlocks:** (motion complete)

---

## Purpose

Animate the SIGNAL zone fading in on app open. The first render of the home screen transitions from blank to visible with a 400ms ease-out fade.

## Why It Exists

The app open sequence communicates that the system is loading state, not broken. It is the designed entry transition from `design-system/motion-system.md`.

## Required Reading

- `design-system/motion-system.md#app-open` — exact timing and easing spec

## Exact Scope

- Apply a CSS opacity transition to `SignalZone.tsx` on mount
- Initial state: `opacity: 0`
- After mount: transition to `opacity: 1` over 400ms with ease-out easing
- Use `useEffect` with a timeout or CSS animation class toggle

## Design-System Constraints

- Duration: 400ms (from motion-system.md)
- Easing: `ease-out` (from motion-system.md — use `var(--motion-ease-out)` if token exists)
- No spring physics, no bounce
- Does not delay interaction — the zone is interactive before the animation completes

## Acceptance Criteria

1. SIGNAL zone fades in from transparent over 400ms on first render
2. Animation does not block user interaction
3. Animation runs once (not on every re-render)
4. Build passes

## Estimated Complexity

M — ~1 hour.

## Claude Execution Guidance

Add a CSS class `.signal-zone--visible` with `opacity: 1`. Apply the transition to `.signal-zone`. Use `useEffect(() => { setVisible(true); }, [])` to trigger the class after mount. The initial render is `opacity: 0` and the effect fires after mount to start the transition.
