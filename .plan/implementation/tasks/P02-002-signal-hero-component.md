# P02-002 — SIGNAL Hero Component (Static)

**Phase:** 02 — Frontend Display Layer
**Complexity:** L (3–6h)
**Status:** NOT_STARTED
**Depends on:** P01-001, P02-001
**Unlocks:** P02-004, P07-002

---

## Purpose

Build the `SignalHero` component in its final visual form using static/hardcoded data. This is the primary interface element — the product's core visual identity.

## Why It Exists

The SIGNAL hero is the first thing a user sees. It must be visually complete and correct before Phase 07 wires it to real data. Building it statically first allows visual verification against the design spec without backend dependencies.

## Required Reading

- `design-system/components/signal-hero.md` — complete layout, typography, spacing spec
- `design-system/tokens/typography.md` — STATE text uses Syne 800
- `product/signal-states.md` — state names, subtitle format examples

## Exact Scope

- Create `frontend/src/components/SignalHero.tsx`
- Implement the props interface (static — no data fetching):
  ```typescript
  interface SignalHeroProps {
    state: string;           // e.g. "READING"
    subtitle?: string;       // e.g. "Day 3 · Baseline forming"
    delta?: string | null;   // e.g. "−8% below your baseline" | null
    isCollapsed: boolean;    // collapse state managed by parent
  }
  ```
- Render with hardcoded `state="READING"`, `subtitle="Day 3 · Baseline forming"`, `delta={null}`, `isCollapsed={false}`
- Render `SignalHero` inside `SignalZone.tsx`
- Apply correct typography: STATE text in Syne 800, subtitle and delta in DM Mono

## Out of Scope

- Collapse animation (P02-004)
- Waveform (P02-003, separate component)
- Scroll trigger logic (P02-004)
- Real data wiring (P07-002)

## Files Expected to Change

```
frontend/src/components/SignalHero.tsx  (new)
frontend/src/components/SignalZone.tsx  (render SignalHero)
```

## Design-System Constraints

- STATE text: `font-family: var(--font-display)`, `font-weight: 800`, size from typography.md
- All other text: `font-family: var(--font-mono)`
- No chromatic color on text — use INK tokens only
- Delta line: only renders when `delta` prop is non-null
- No box-shadow, no glassmorphism, no gradient background on the hero

## UX Constraints

- SIGNAL zone height: `minHeight: '48vh'` when not collapsed
- Collapsed state (isCollapsed=true): component renders at 44px height (full collapse in P02-004)
- STATE text is not a button — no hover state, no cursor:pointer

## Acceptance Criteria

1. SignalHero renders with correct layout matching signal-hero.md spec
2. STATE text uses Syne 800
3. Subtitle text uses DM Mono
4. Delta line does not render when `delta` prop is null
5. isCollapsed=false renders the full hero (48vh zone)
6. No raw hex colors in the component
7. Build passes

## Edge Cases

- `state` prop may be any of the 7 SIGNAL states — the component renders the string as-is (no special casing per state in this task)
- Very long state names: the layout must not break (STATE text can wrap)

## Failure Cases

- Typography token undefined → check that P02-001 is complete first

## Estimated Complexity

L — ~3 hours. Design-faithful implementation with multiple layout concerns.

## Claude Execution Guidance

Read signal-hero.md fully before writing a line. The spec defines exact layout, typography sizes, and spacing. Implement against the spec, not intuition. After implementing, visually compare against the spec. Apply the type scale classes from P02-001.
