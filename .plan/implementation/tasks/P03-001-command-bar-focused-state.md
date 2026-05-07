# P03-001 — Command Bar Focused State

**Phase:** 03 — Command Bar Hardening
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P01-001
**Unlocks:** (phase complete)

---

## Purpose

Add the designed focus state visual effects to the CommandBar component: gold border-top on focus, scrim overlay, and a permanent gradient fade above the bar.

## Why It Exists

The command bar currently has no focus state. The design spec (`design-system/components/command-bar.md`) defines specific visual effects that communicate input mode to the user without adding elevation or shadows.

## Required Reading

- `design-system/components/command-bar.md` — complete focus state spec

## Exact Scope

- Add gold border-top on input focus: `1px solid rgba(237,184,74,0.25)` (this is `--gold-1` at 25% opacity)
- Add scrim (semi-transparent overlay behind the command bar) that appears on focus and disappears on blur
- Add gradient fade above the command bar: `linear-gradient(to top, var(--bg-0), transparent)`, ~80px height, always visible (not just on focus)
- Focus state changes must not affect command bar height or trigger layout shift

## Out of Scope

- Command bar functionality changes
- Any changes to how entries are submitted

## Files Expected to Change

```
frontend/src/components/CommandBar.tsx  (focus state logic + styles)
frontend/src/index.css or CommandBar.css (gradient fade + scrim styles)
```

## Design-System Constraints

- Gold border: `--gold-1` token only — no other chromatic color
- No box-shadow on the command bar (invariant E-INV-05)
- Scrim: `background: rgba(0,0,0,0.4)` or equivalent dark overlay — NOT glassmorphism
- Gradient fade: `linear-gradient(to top, var(--bg-0), transparent)` — not a solid color
- The gradient is a separate element positioned above the bar, not a background on the bar itself

## UX Constraints

- Gradient is always visible (not conditional on focus)
- Scrim appears on focus, disappears on blur
- Command bar height does not change on focus
- Tapping the scrim blurs the input

## Acceptance Criteria

1. Gold border-top appears when input is focused
2. Scrim appears on focus, disappears on blur
3. Gradient fade is always visible above the command bar
4. Command bar height is identical in focused and unfocused states
5. Tapping scrim blurs the input
6. Build passes

## Failure Cases

- Layout shift on focus → check that border is applied as `border-top` not `outline` and that the element has `box-sizing: border-box`

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Use React state (`isFocused`) to drive the scrim and border. The gradient is a `position: absolute` element above the bar, always rendered. The scrim is `position: fixed; inset: 0` at a low z-index, rendered conditionally. Add `onFocus`/`onBlur` handlers to the input element.
