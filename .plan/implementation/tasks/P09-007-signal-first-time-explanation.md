# P09-007 — SIGNAL Activation + First-Time Explanation

**Phase:** 09 — Onboarding Flow
**Complexity:** L (3–6h)
**Status:** NOT_STARTED
**Depends on:** P09-006, P06-003
**Unlocks:** (onboarding complete)

---

## Purpose

Show a one-time, dismissible overlay explaining what SIGNAL is to new users on their first home screen visit. Also triggers the first SIGNAL computation for the new user.

## Why It Exists

New users see READING state but don't know what SIGNAL means. A one-time contextual explanation makes the product legible on first contact without being a product tour.

## Required Reading

- Phase 09 phase file: `phases/phase-09-onboarding.md#first-time explanation` — exact content spec
- `product/signal-states.md#READING` — READING state description for users

## Exact Scope

**First-time explanation overlay:**
- Triggered when: home screen renders AND `localStorage.getItem('nouriq_signal_explained') !== 'true'`
- Content (3 elements only):
  1. "SIGNAL tracks your pattern" — DM Mono, `--ink-1`
  2. "Log meals for 7 days. Your baseline forms automatically." — DM Mono, `--ink-2`
  3. "Got it" button → sets `localStorage.setItem('nouriq_signal_explained', 'true')` and dismisses
- Renders as a bottom sheet or centered overlay (per signal-hero.md — check spec)
- Appears over the home screen (home screen visible behind it)
- Dismisses on: "Got it" button tap, or tap outside

**First SIGNAL computation trigger:**
- After onboarding: call `POST /api/signal` to trigger the first SIGNAL computation (which will return READING for a new user)
- This ensures the SignalState document exists from day 1

## Files Expected to Change

```
frontend/src/components/SignalExplanation.tsx   (new — overlay component)
frontend/src/components/SignalZone.tsx          (render SignalExplanation conditionally)
```

## Design-System Constraints

- Overlay background: `--bg-1` (not a dark scrim — this is informational, not modal-blocking)
- No illustration
- No multi-step slides
- Exactly 2 text lines + 1 button
- No close X icon — only the "Got it" button dismisses

## Architecture Constraints

- The `localStorage` flag is the only persistence for this — no backend record needed
- `POST /api/signal` is called once after onboarding (in P09-006 or here — pick one location and document it)

## Acceptance Criteria

1. Overlay appears on first home screen visit for new users
2. "Got it" dismisses it and sets the localStorage flag
3. Overlay does not appear on subsequent visits
4. Tap outside dismisses it
5. `POST /api/signal` is called once after onboarding
6. Build passes

## Estimated Complexity

L — ~3 hours (overlay implementation + localStorage logic + signal trigger coordination).

## Claude Execution Guidance

Check the localStorage flag before rendering the overlay. Use `useEffect` to call `POST /api/signal` once (guard with a ref to prevent double-call in StrictMode). The overlay itself is a simple component — the complexity is in the coordination with the SIGNAL trigger.
