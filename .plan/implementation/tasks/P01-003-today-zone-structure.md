# P01-003 — TODAY Zone Structure

**Phase:** 01 — Frontend Layout Foundation
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P01-001
**Unlocks:** P02-005

---

## Purpose

Build the internal structure of the TODAY zone: three sub-section placeholders (Daily Position, Training, Micros).

## Why It Exists

The TODAY zone needs a defined internal layout before Phase 02 can fill it with macro rows and real content. The three sub-sections have different scopes and need separate containers.

## Required Reading

- `design-system/home-screen.md#TODAY zone` — sub-section layout spec
- Phase 01 note: **U-001 must be resolved before building the Training sub-section**

## Unresolved Decision: U-001

Before implementing, check `.plan/implementation/PROGRESS.md` for U-001 status.

U-001: Should the Training sub-section in v1.1 be a text-log placeholder or a full workout sheet?

- If resolved as **text-log placeholder**: render a single `<div className="today-training">` with no internal structure
- If resolved as **full workout sheet**: get the spec from the product docs before building

If U-001 is still unresolved, implement the text-log placeholder (minimal, reversible) and flag U-001 in PROGRESS.md.

## Exact Scope

- Add three sub-section containers inside `TodayZone.tsx`:
  - `<div className="today-daily-position">` — will hold macro rows (P02-005)
  - `<div className="today-training">` — placeholder (see U-001)
  - `<div className="today-micros">` — placeholder (v1.2 feature, empty div only)
- Correct vertical ordering and spacing using spacing tokens

## Out of Scope

- Building macro row content (P02-005)
- Any real data (Phase 07)
- Training section content beyond a placeholder

## Files Expected to Change

```
frontend/src/components/TodayZone.tsx   (add sub-section structure)
```

## Design-System Constraints

- Use `--spacing-*` tokens for gaps between sub-sections
- No borders between sub-sections
- Sub-section labels ("DAILY POSITION" etc.) are NOT headings — they are rendered inline by the content components that go inside

## Acceptance Criteria

1. TodayZone renders three sub-sections in correct order
2. Sub-sections have correct CSS class names
3. Spacing between sub-sections uses design tokens (not raw pixel values)
4. Build passes

## Risks

- U-001 unresolved — implement text-log placeholder and document

## Estimated Complexity

M — ~1 hour once U-001 is resolved.

## Claude Execution Guidance

Check U-001 status in PROGRESS.md first. If resolved, follow the decision. If not, build the placeholder and leave a comment in PROGRESS.md about the outstanding decision.
