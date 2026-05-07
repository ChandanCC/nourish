# P07-004 — TODAY Zone Connected to Real Data

**Phase:** 07 — Frontend–Backend Integration
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-001, P02-005
**Unlocks:** P07-005, P07-006, P08-003, P08-004

---

## Purpose

Wire the TODAY zone macro rows to real data from the home screen payload, showing today's actual nutrition totals against user targets.

## Why It Exists

The macro rows were built with hardcoded data in P02-005. This task replaces mock values with real data from `HomeScreenPayload.today`.

## Exact Scope

- In `TodayZone.tsx`: receive data from parent (HomeScreen or SignalZone) via props
- Parent passes `today` data from `useHomeScreen()` payload
- Pass to `MacroRow` components:
  ```typescript
  <MacroRow label="PROTEIN" current={today.protein} target={today.targets.protein} unit="g" />
  <MacroRow label="CARBS" current={today.carbs} target={null} unit="g" />
  <MacroRow label="FAT" current={today.fat} target={null} unit="g" />
  <MacroRow label="CALORIES" current={today.calories} target={today.targets.calories} unit="kcal" />
  ```
- Display today's calorie total as a prominent header above the rows

## Out of Scope

- Day selection (P07-005 — that changes which day's data TodayZone shows)
- Animation (P08-003, P08-004)

## Files Expected to Change

```
frontend/src/components/TodayZone.tsx   (accept today prop, pass to MacroRows)
frontend/src/pages/HomeScreen.tsx or App.tsx (pass today data down to TodayZone)
```

## Architecture Constraints

- No `useHomeScreen()` inside TodayZone — data comes as props
- `target` is null when user has no goal set → MacroRow handles null target gracefully (from P02-005)

## Acceptance Criteria

1. Protein row shows real protein value and target from the backend
2. Calories row shows real calories for today
3. Targets are null for macros without explicit targets (carbs, fat)
4. Build passes

## Estimated Complexity

M — ~1.5 hours. Prop threading + removing mock data.

## Claude Execution Guidance

Pass `today` from the home screen payload as a prop through the component tree. Remove all hardcoded numbers from TodayZone.tsx. Do not add useHomeScreen() to TodayZone — follow the data-down pattern.
