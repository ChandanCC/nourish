# P09-002 — Welcome Screen

**Phase:** 09 — Onboarding Flow
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P09-001
**Unlocks:** P09-003

---

## Purpose

Build the first onboarding screen: a minimal welcome with product name and a "Get started" call-to-action.

## Why It Exists

The welcome screen is the user's first experience of the product's visual language and tone. It must embody the design system without being a marketing slide.

## Exact Scope

- Create `frontend/src/pages/onboarding/WelcomeScreen.tsx`
- Content:
  - Product name "Nouriq" in Syne 800 (large, using correct type scale class)
  - Single line subtitle in DM Mono: "Precision nutrition intelligence."
  - "Get started" button → navigates to goal selection screen
- Full-screen layout, `--bg-0` background
- No illustrations, no icons, no animation beyond the standard button active state

## Design-System Constraints

- Product name: Syne 800, largest type scale class
- Subtitle: DM Mono, `--ink-2` opacity (subdued)
- Button: no special color — use `--ink-1` text, `--bg-2` background (standard surface)
- No gold accent on this screen (the product name is not a logo treatment)

## UX Constraints

- `architecture/ARCHITECTURE_INVARIANTS.md#U-INV-03` — onboarding must not feel like a product tour
- No "We'll help you reach your goals!" copy
- No progress indicator (it's a 3-screen flow, not 10 steps)

## Acceptance Criteria

1. Welcome screen renders with correct typography
2. Button navigates to goal selection
3. No motivational copy, no illustrations
4. Build passes

## Estimated Complexity

M — ~1 hour. Simple static screen.

## Claude Execution Guidance

This is a dead-simple static screen. The only question is typography correctness. Use the type scale classes from P02-001. One heading, one subline, one button.
