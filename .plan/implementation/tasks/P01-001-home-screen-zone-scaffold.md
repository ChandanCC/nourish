# P01-001 — Home Screen Zone Scaffold

**Phase:** 01 — Frontend Layout Foundation
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** —
**Unlocks:** P01-002, P01-003, P01-004, P02-001, P02-002, P02-003, P03-001

---

## Purpose

Create the four-zone home screen layout that replaces the current tab-based navigation. This is the foundational structural task — every subsequent UI task builds on top of it.

## Why It Exists

The current app has a tab-based navigation that violates `decisions/007-no-tab-navigation.md`. The product requires a single-surface scroll layout with four distinct zones. Without this scaffold, all display components (Phase 02) have no structural home.

## Required Reading

- `design-system/home-screen.md` — zone layout, heights, scroll behavior
- `decisions/007-no-tab-navigation.md` — why tab nav is removed

## Exact Scope

- Create `frontend/src/components/HomeScreen.tsx` as a wrapper component
- Create `frontend/src/components/SignalZone.tsx` as a placeholder
- Create `frontend/src/components/TodayZone.tsx` as a placeholder (sub-sections in P01-003)
- Create `frontend/src/components/LogZone.tsx` as a placeholder (entry list in P01-004)
- Update `frontend/src/pages/App.tsx` to render `<HomeScreen>` instead of the current tab UI
- Command bar remains at bottom (already exists — do not move or restyle)

## Out of Scope

- Removing tab system (P01-002)
- Building sub-sections in TodayZone (P01-003)
- Entry list in LogZone (P01-004)
- Any design work inside the zones
- Font loading (P02-001)

## Files Expected to Change

```
frontend/src/pages/App.tsx              (replace tab UI with <HomeScreen>)
frontend/src/components/HomeScreen.tsx  (new)
frontend/src/components/SignalZone.tsx  (new — placeholder only)
frontend/src/components/TodayZone.tsx   (new — placeholder)
frontend/src/components/LogZone.tsx     (new — placeholder)
```

## Architecture Constraints

- Zones are separate components — not sections in one component
- Home screen is a single scroll surface (no overflow:hidden on parent)
- SIGNAL zone: 48vh minimum height initially
- Command bar is fixed bottom (CSS position:fixed), not part of scroll surface
- No new CSS classes that conflict with existing token names

## UX Constraints

- Scrolling the page scrolls through all four zones as one surface
- No sticky zone headers (no `position:sticky` except command bar)
- Zone ordering (top to bottom): SIGNAL → TODAY → LOG

## Design-System Constraints

- Use `--bg-0` for page background
- No new color values — placeholder zones can be empty
- No border between zones

## Runtime Constraints

- This is layout only — no data fetching, no hooks
- `npm run build -w frontend` must pass with 0 errors

## Acceptance Criteria

1. Home screen renders four zones in correct order: SIGNAL → TODAY → LOG (command bar fixed below)
2. Page scrolls as a single surface
3. SignalZone has `min-height: 48vh`
4. No tab bar UI renders anywhere
5. Build passes

## Edge Cases

- If the existing App.tsx has JSX that will conflict with the new layout, remove the conflicting JSX entirely (not commented out)
- If command bar is not already fixed, fix it in this task (it is in scope as structural positioning)

## Failure Cases

- Build error from conflicting imports → remove the conflicting import, don't keep dead code
- SIGNAL zone height not 48vh → set `minHeight: '48vh'` via inline style or CSS class using spacing tokens

## Test Expectations

No automated tests required. Visual check: four zones visible in browser, page scrolls, no tab bar.

## Follow-Up Tasks Unlocked

P01-002 (remove tab system), P01-003 (TODAY sub-sections), P01-004 (LOG entry list), P02-002 (SignalHero), P03-001 (command bar focus state)

## Risks

- Existing CSS may fight the new layout (z-index conflicts, overflow clipping)
- Command bar may need `z-index` adjustment if covered by zone content

## Estimated Complexity

M — ~2 hours. Layout work without data concerns.

## Claude Execution Guidance

Read `design-system/home-screen.md` first. Create the new components as minimal wrappers with correct CSS. Update App.tsx last, after all zone components compile. Confirm build passes before marking complete.
