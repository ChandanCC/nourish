# P02-004 — Collapsed SIGNAL Strip

**Phase:** 02 — Frontend Display Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P02-002
**Unlocks:** (visual feature complete)

---

## Purpose

Add scroll-triggered collapse to the SIGNAL hero: when the hero scrolls out of view, a 44px collapsed strip appears at the top of the viewport showing state and delta in compact form.

## Why It Exists

The collapsed strip keeps SIGNAL state visible while the user scrolls through their LOG entries. It is the designed scroll-aware behavior from `design-system/components/signal-hero.md`.

## Required Reading

- `design-system/components/signal-hero.md#collapsed state` — 44px strip layout spec

## Exact Scope

- Add `IntersectionObserver` in `SignalZone.tsx` to detect when `SignalHero` leaves the viewport
- Pass `isCollapsed` state down to `SignalHero` as a prop
- When `isCollapsed=true`: `SignalHero` renders the 44px strip layout (not the full hero)
- 44px strip: single line, state name + delta (if present), correct typography, `--bg-1` background
- Collapsed strip is `position: sticky; top: 0` so it stays at viewport top

## Out of Scope

- Animation of the collapse transition (that's P08 motion work — this is the structural state)
- Any data changes

## Files Expected to Change

```
frontend/src/components/SignalZone.tsx  (add IntersectionObserver, isCollapsed state)
frontend/src/components/SignalHero.tsx  (render collapsed strip when isCollapsed=true)
```

## Design-System Constraints

- Collapsed strip height: exactly 44px
- Background: `--bg-1` (not bg-0)
- Typography: same Syne/DM Mono split as full hero, but smaller sizes per typography.md
- No box-shadow on the collapsed strip (invariant E-INV-05)

## UX Constraints

- Collapse triggers when the hero zone top scrolls above 44px from viewport top
- No visual flash when collapsing — the state change is immediate (animation is Phase 08)
- Collapsed strip does not occlude the command bar

## Acceptance Criteria

1. Scrolling the page past the SIGNAL zone shows the 44px strip
2. Strip renders state name and delta (if non-null)
3. Strip is sticky at top: 0
4. Strip is exactly 44px tall
5. Scrolling back up to the hero hides the strip and shows the full hero
6. Build passes

## Failure Cases

- IntersectionObserver not triggering → add a fallback scroll event listener

## Estimated Complexity

M — ~2 hours. Observer setup + conditional rendering.

## Claude Execution Guidance

The observer should watch a sentinel element at the bottom of the full SignalHero. When it exits the viewport (scrolled up past top), set `isCollapsed=true`. Pass the boolean as prop to SignalHero. In SignalHero, use `isCollapsed` to switch between two JSX branches (full hero vs. 44px strip).
