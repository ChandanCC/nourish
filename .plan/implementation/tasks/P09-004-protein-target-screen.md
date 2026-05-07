# P09-004 — Protein Target Screen

**Phase:** 09 — Onboarding Flow
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P09-003
**Unlocks:** P09-005, P09-006

---

## Purpose

Build the protein target onboarding screen: user enters their daily protein target in grams.

## Why It Exists

Protein target is the primary nutritional goal tracked with color in Nouriq. It is the only macro with explicit target tracking in v1.1. The user must set it during onboarding so the SIGNAL engine has a baseline.

## Exact Scope

- Create `frontend/src/pages/onboarding/ProteinTargetScreen.tsx`
- Default value: 160g (pre-filled in the input)
- Input: plain number input, DM Mono font, large type
- Display format: `[input]g protein / day`
- "Finish setup" button → calls P09-005 to save, then navigates to home screen
- Accept `goal` from previous screen (passed via route state or prop)

## Design-System Constraints

- Input: no special styling beyond DM Mono, large type, `--bg-1` background
- No slider, no range display, no "recommended" label
- No explanation of what the number means — just the input

## UX Constraints

- Input accepts only integers (validate: parseInt, reject decimals and negatives)
- Min value: 30g (prevent absurd values — silently clamp if below)
- Max value: 500g (silently clamp if above)
- No error message for clamped values — just clamp and proceed

## Acceptance Criteria

1. Input pre-fills with 160g
2. User can change the value
3. "Finish setup" submits (triggers P09-005)
4. Values below 30 or above 500 are clamped silently
5. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Use `useState(160)` for the protein value. On input change, parse to integer and clamp. The "Finish setup" button calls the backend save function (P09-005), which is awaited before navigation. Show a brief loading state on the button during the save.
