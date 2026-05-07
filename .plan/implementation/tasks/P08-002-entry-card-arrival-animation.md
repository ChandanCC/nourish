# P08-002 — Entry Card Arrival Animation

**Phase:** 08 — Motion System
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P01-004
**Unlocks:** (motion complete)

---

## Purpose

Animate new entry cards arriving in the LOG zone: each card translates up from slightly below its final position and fades in, with a 40ms stagger between cards.

## Why It Exists

The entry arrival animation communicates that a new item has been added to the list. It is the designed entry list behavior from `design-system/motion-system.md`.

## Required Reading

- `design-system/motion-system.md#entry-arrival` — timing, stagger, easing spec

## Exact Scope

- Each `EntryCard` component applies a CSS animation on mount
- Animation: translate from `translateY(12px)` to `translateY(0)` + opacity 0 → 1
- Duration: 200ms per card, ease-out easing
- Stagger: 40ms delay per card index (first card: 0ms, second: 40ms, third: 80ms, etc.)
- Apply stagger via inline `animationDelay` style based on the card's index in the list
- Animation runs once per mount — do not re-animate on re-render

## Design-System Constraints

- Duration: 200ms (from motion-system.md)
- Stagger: 40ms (from motion-system.md)
- Easing: ease-out
- No spring, no bounce

## Acceptance Criteria

1. New entry cards animate up from below on first render
2. Stagger is visible — cards don't all animate simultaneously
3. Animation runs once per mount
4. Build passes

## Edge Cases

- If there are more than 10 entries, cap stagger at 400ms total (clamp max delay)

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Add a CSS `@keyframes entryArrival` animation. Apply it to `.entry-card` with the appropriate duration and easing. Pass the card's index as a prop or derive it from the list context to set `animationDelay` via inline style.
