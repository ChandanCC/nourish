# Phase 02 — Frontend Display Layer

**Status:** NOT_STARTED
**Tasks:** P02-001, P02-002, P02-003, P02-004, P02-005
**Estimated duration:** 6–9 hours

---

## Purpose

Build all visual components in their final designed form, using static/mock data. After Phase 02, the product looks exactly like the spec — SIGNAL hero, waveform, macro rows, typography all correct. No real backend data yet.

Phase 07 wires these components to real data. Phase 02 builds them to be wired.

---

## Prerequisites

- Phase 01 complete (zone scaffold exists)
- Design tokens are live in `frontend/src/index.css`

---

## Exit Conditions (Phase Complete When)

1. Typography: Syne 800 on STATE text, DM Mono everywhere else, all six sizes applied correctly
2. SIGNAL hero renders with hardcoded `READING` state, correct layout, correct typography
3. Waveform renders 7 bars at mock heights with correct WAVE token colors
4. Collapsed SIGNAL strip appears at 44px height with scroll trigger working
5. Macro rows render in TODAY zone with mock progress bars using `--bar-fill` / `--bar-track`
6. No raw hex values introduced; no new banned colors

---

## Tasks

| Task | What it does |
|---|---|
| P02-001 | Loads Google Fonts (Syne 700/800, DM Mono 400/500), applies type scale classes |
| P02-002 | Builds SignalHero component: STATE text, subtitle, delta line, layout |
| P02-003 | Builds Waveform component: 7 bars, WAVE tokens, day labels, baseline axis |
| P02-004 | Adds scroll-triggered collapse to SignalHero; builds 44px collapsed strip |
| P02-005 | Builds macro row display in TodayZone (protein/carbs/fat progress rows) |

**Dependency order:** P02-001 is independent. P02-002 before P02-004. P02-003 can parallel P02-002. P02-005 depends on P01-003.

---

## Architecture Constraints

- `design-system/components/signal-hero.md` — exact spec for SignalHero
- `design-system/components/waveform.md` — exact spec for Waveform
- `design-system/tokens/typography.md` — font loading, scale
- `design-system/VISUAL_GUARDRAILS.md` — no glassmorphism, no gradient backgrounds
- Waveform bars: `--wave-surplus`, `--wave-deficit`, `--wave-today`, `--wave-baseline` tokens only
- Progress bars: `--bar-fill` / `--bar-track` only — no color coding

---

## Key Implementation Notes

**SignalHero props interface (static):**
```typescript
interface SignalHeroProps {
  state: string;           // e.g. "READING"
  subtitle?: string;       // e.g. "Day 3 · Baseline forming"
  delta?: string | null;   // e.g. "−8% below your baseline" | null
  isCollapsed: boolean;
}
```
The component doesn't fetch data — it receives props. Wiring happens in Phase 07.

**Waveform props interface (static):**
```typescript
interface WaveformProps {
  days: WaveformDay[];     // 7 items
  selectedDay: number;     // 0–6 index
  baseline: number;        // for proportional bar heights
  onDaySelect?: (index: number) => void;
}
interface WaveformDay {
  calories: number;
  isToday: boolean;
  label: string;           // "M", "T", etc.
}
```

**Scroll collapse:** Use `IntersectionObserver` or scroll event listener to detect when SIGNAL hero scrolls out of view. The threshold is when the hero zone top goes above `44px` from viewport top.

---

## What Exists After This Phase

- A fully designed home screen (visually complete)
- All components accept props and render correctly
- Typography system applied throughout
- Static/hardcoded data in all components
- No backend calls for SIGNAL data
