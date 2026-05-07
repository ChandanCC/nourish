# P02-005 — Macro Rows in TODAY Zone

**Phase:** 02 — Frontend Display Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P01-003
**Unlocks:** P07-004, P08-003, P08-004

---

## Purpose

Build the macro progress rows in the TODAY zone's Daily Position sub-section: protein, carbs, fat, and calories. Static/hardcoded data only.

## Why It Exists

The macro rows are the secondary data layer below SIGNAL state. They show today's nutritional position against targets. Building them statically first ensures they're visually correct before Phase 07 wires real data.

## Required Reading

- `design-system/components/macro-row.md` — layout, progress bar spec
- `design-system/components/progress-bar.md` — bar tokens, width calculation

## Exact Scope

- Create `frontend/src/components/MacroRow.tsx`
- Props interface:
  ```typescript
  interface MacroRowProps {
    label: string;      // "PROTEIN", "CARBS", "FAT", "CALORIES"
    current: number;
    target: number;
    unit: string;       // "g" or "kcal"
  }
  ```
- Progress bar fill: `(current / target) × 100%`, capped at 100%
- Render 4 rows in `TodayZone.tsx` with hardcoded mock values
- Add a daily calories total line above the macro rows

## Out of Scope

- Real data wiring (P07-004)
- Number counting animation (P08-003)
- Progress bar fill animation (P08-004)
- Fiber row (check product docs — may be in a later version)

## Files Expected to Change

```
frontend/src/components/MacroRow.tsx    (new)
frontend/src/components/TodayZone.tsx   (render 4 MacroRows in daily-position sub-section)
```

## Design-System Constraints

- Progress bar fill: `background: var(--bar-fill)` ONLY
- Progress bar track: `background: var(--bar-track)` ONLY
- No color coding per macro (no green for protein, no yellow for carbs)
- Label text: DM Mono, uppercase, from typography scale
- Values text: DM Mono
- No percentage display — show `current / target unit` format

## Acceptance Criteria

1. 4 macro rows render in TodayZone
2. Progress bars use `--bar-fill` and `--bar-track` tokens
3. No color other than the bar tokens and INK tokens
4. Bar width is proportional to current/target ratio
5. Bar width caps at 100% (does not overflow container)
6. Build passes

## Edge Cases

- `target` is null (user hasn't set goals yet) → render bar at 0%, show `— / —` for values
- `current > target` → bar caps at 100%, no color change

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Read macro-row.md and progress-bar.md specs before implementing. The progress bar is a `<div>` with width set via inline style. No third-party chart library. Keep MacroRow stateless — it receives all data as props.
