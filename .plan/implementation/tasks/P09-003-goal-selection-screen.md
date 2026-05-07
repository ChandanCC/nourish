# P09-003 — Goal Selection Screen

**Phase:** 09 — Onboarding Flow
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P09-002
**Unlocks:** P09-004

---

## Purpose

Build the goal selection onboarding screen: user picks from 4 goal options.

## Why It Exists

Goal selection is required to configure the SIGNAL system. The goal informs which SIGNAL states are most relevant and what the AI instruction targets.

## Exact Scope

- Create `frontend/src/pages/onboarding/GoalSelectionScreen.tsx`
- Store selected goal in local component state
- Four options (display as selectable rows):
  - "Build muscle" → `muscle_gain`
  - "Reduce body fat" → `fat_loss`
  - "Maintain weight" → `maintenance`
  - "Athletic performance" → `performance`
- "Continue" button: disabled until a goal is selected
- On continue: navigate to protein target screen, pass selected goal forward

## Design-System Constraints

- Selected option: use `--bg-2` background + `--gold-1` left border (1px)
- Unselected option: `--bg-1` background, no border
- No color coding per goal (not green for fat_loss, not red for muscle_gain)
- Labels in DM Mono, no description text under options

## UX Constraints

- No default pre-selected option (user must make an active choice)
- No "Recommended" badge on any option
- No icons

## Acceptance Criteria

1. Four options render as selectable rows
2. Selected option shows the defined selected style
3. Continue button disabled until selection made
4. Selected value is passed to the next screen
5. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Use `useState<Goal | null>(null)` for selection. Map over the four options to render rows. Apply conditional className for selected state. Disable the Continue button via `disabled={!selectedGoal}`. Pass goal via route state or prop on navigation.
