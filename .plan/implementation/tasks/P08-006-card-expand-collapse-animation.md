# P08-006 — Card Expand/Collapse Animation

**Phase:** 08 — Motion System
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P01-004
**Unlocks:** (motion complete)

---

## Purpose

Animate the expansion and collapse of entry card detail view when a user taps an entry card.

## Why It Exists

Entry cards can be expanded to show more detail (macro breakdown of the entry). The expand/collapse animation communicates the state change clearly. From `design-system/motion-system.md`.

## Required Reading

- `design-system/motion-system.md#card-expand-collapse` — timing and easing
- `design-system/components/entry-card.md` — what's in the expanded view

## Exact Scope

- In `EntryCard.tsx`: add toggle state for expanded/collapsed
- Animate `height` from collapsed height to expanded height on toggle
- Duration: 200ms expand, 160ms collapse (expand is slightly slower)
- Easing: ease-in-out for expand, ease-in for collapse
- Challenge: animating height from `auto` to `auto` requires a workaround

## Height Animation Workaround

CSS `height: auto` cannot be directly transitioned. Use:
1. Measure the expanded height using a ref before collapsing
2. Transition from the measured pixel height to `0px` on collapse
3. Or use `max-height` with a sufficiently large value (simpler but less precise)

For v1.1, `max-height` approach is acceptable:
- Collapsed: `max-height: 0; overflow: hidden`
- Expanded: `max-height: 200px; overflow: hidden`
- Transition: `max-height 200ms ease-in-out`

## Design-System Constraints

- Expand: 200ms, ease-in-out
- Collapse: 160ms, ease-in
- No bounce
- Tapping the card anywhere toggles expand/collapse

## Acceptance Criteria

1. Tapping an entry card expands it to show macro detail
2. Tapping again collapses it
3. Expand animation is ~200ms, collapse is ~160ms
4. Build passes

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Use `useState(false)` for `isExpanded`. The detail section has `max-height` set via inline style: `isExpanded ? '200px' : '0px'`. Add CSS transition on `max-height`. Adjust the `200px` cap based on actual content height in the expanded state. If content clips, increase the value.
