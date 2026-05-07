# Phase 01 — Frontend Layout Foundation

**Status:** NOT_STARTED
**Tasks:** P01-001, P01-002, P01-003, P01-004
**Estimated duration:** 3–5 hours

---

## Purpose

Establish the four-zone home screen architecture per `design-system/home-screen.md`. Replace the current tab-based navigation with the single-surface layout.

This phase produces no visible SIGNAL data — all zones are structurally present but empty or contain mock data. Phase 02 fills the display layer.

---

## Prerequisites

- P0 design tokens are live (complete ✅)
- P4 EntryCard is redesigned (complete ✅)
- `frontend/src/index.css` contains all 23 CSS custom properties

---

## Exit Conditions (Phase Complete When)

1. The home screen renders four zones in correct vertical order: SIGNAL → TODAY → LOG → (command bar, fixed)
2. No tab bar or tab navigation exists in the codebase
3. The page scrolls as a single surface
4. Zone heights are correct (SIGNAL hero: 48vh initial)
5. Command bar is fixed to the bottom
6. `npm run build -w frontend` passes with 0 errors

---

## Tasks

| Task | What it does |
|---|---|
| P01-001 | Creates the four-zone container in App.tsx or a new HomeScreen component |
| P01-002 | Removes WEEK/day tab system and tab-related state |
| P01-003 | Creates TODAY zone with three sub-section placeholders (Daily Position, Training, Micros) |
| P01-004 | Creates LOG zone structure with entry list container |

**Dependency order:** P01-001 first, then P01-002/P01-003/P01-004 in any order.

---

## Architecture Constraints

- `design-system/home-screen.md` is the spec. Match it.
- No new navigation elements (invariant U-INV-05)
- No tab bar (decision `decisions/007-no-tab-navigation.md`)
- Home screen is a single scroll surface

---

## Key Design Decisions in This Phase

**U-001 must be resolved before P01-003:** The TODAY zone has a "Training" sub-section. Its scope in v1.1 (text-log only vs. full workout sheet) affects how the placeholder is structured. Resolve U-001 before building P01-003.

**Component architecture:** Decide whether zones are separate components (`<SignalZone>`, `<TodayZone>`, `<LogZone>`) or sections within a single component. The correct answer is separate components — each zone has its own data requirements and will be updated independently.

---

## Files Touched in This Phase

```
frontend/src/pages/App.tsx              (major restructure)
frontend/src/components/TodayZone.tsx   (new)
frontend/src/components/LogZone.tsx     (new)
frontend/src/components/HomeScreen.tsx  (new, optional — wraps the three zones)
```

---

## What Exists After This Phase

- A four-zone layout that scrolls as a single surface
- No active SIGNAL data (hardcoded placeholder)
- TODAY zone shows empty sub-sections
- LOG zone shows the existing entry list (already implemented)
- Command bar at bottom (existing)
- No tab navigation anywhere in the codebase
