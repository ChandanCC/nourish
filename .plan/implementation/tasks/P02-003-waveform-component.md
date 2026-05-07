# P02-003 — Waveform Component (Static)

**Phase:** 02 — Frontend Display Layer
**Complexity:** L (3–6h)
**Status:** NOT_STARTED
**Depends on:** P02-001
**Unlocks:** P07-003, P08-005

---

## Purpose

Build the `Waveform` component: 7 bars representing the last 7 days, with correct WAVE token colors, day labels, and a baseline axis. Static/hardcoded data only.

## Why It Exists

The waveform is the primary data visualization in Nouriq. It must be visually correct before Phase 07 wires it to real DayAggregate data.

## Required Reading

- `design-system/components/waveform.md` — complete layout, bar sizing, color rules, label spec

## Exact Scope

- Create `frontend/src/components/Waveform.tsx`
- Props interface:
  ```typescript
  interface WaveformProps {
    days: WaveformDay[];     // exactly 7 items
    selectedDay: number;     // 0–6, today = 6
    baseline: number;        // kcal, used for proportional bar heights
    onDaySelect?: (index: number) => void;
  }
  interface WaveformDay {
    calories: number;
    isToday: boolean;
    label: string;           // "M", "T", "W", "T", "F", "S", "S"
  }
  ```
- Render with hardcoded mock data (7 days, varying calories, today = last bar)
- Bar heights: proportional to `calories / baseline`, capped at some max height
- Bar colors: `--wave-surplus` if calories > baseline, `--wave-deficit` if < baseline, `--wave-today` for today's bar
- Baseline axis: horizontal line at the baseline height (`--wave-baseline` color)
- Day labels: short day letter below each bar
- Selected day: highlighted bar (see waveform.md for selection style)

## Out of Scope

- Rise animation (P08-005)
- Real data wiring (P07-003)
- Day selection updating TODAY zone (P07-005)

## Files Expected to Change

```
frontend/src/components/Waveform.tsx    (new)
frontend/src/components/SignalZone.tsx  (render Waveform below SignalHero)
```

## Design-System Constraints

- Bar colors: `--wave-surplus`, `--wave-deficit`, `--wave-today`, `--wave-baseline` ONLY
- No color coding for macros — this visualization is calories-only
- No raw hex values
- Baseline axis uses `--wave-baseline` color token

## Acceptance Criteria

1. Waveform renders 7 bars with proportional heights
2. Bars use correct WAVE token colors based on above/below baseline
3. Today's bar uses `--wave-today` token
4. Baseline axis line is visible
5. Day labels render below bars
6. Selected day is visually distinct (per waveform.md spec)
7. No raw hex values in the component
8. Build passes

## Edge Cases

- All 7 days have 0 calories (all bars at 0 height) — render flat bars, not hidden
- Calories significantly above baseline — bar height should cap at max container height, not overflow

## Estimated Complexity

L — ~3 hours. Proportional sizing math + multiple color rules.

## Claude Execution Guidance

Read waveform.md spec carefully for the bar height calculation and selection state. The proportional height is `(calories / baseline) × maxBarHeight`. Use inline styles for dynamic heights. Use CSS classes for static color application.
