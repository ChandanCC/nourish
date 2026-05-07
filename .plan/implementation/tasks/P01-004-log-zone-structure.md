# P01-004 — LOG Zone Structure

**Phase:** 01 — Frontend Layout Foundation
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P01-001
**Unlocks:** P08-002, P08-006

---

## Purpose

Create the LOG zone container that will hold the entry list. The entry list (EntryCard components) already exists — this task places it in the new zone structure.

## Why It Exists

The LOG zone needs a correctly-structured container so Phase 08 can animate entry arrivals and card expansion from a stable structural base.

## Exact Scope

- Update `LogZone.tsx` to include the entry list container
- Move existing entry list rendering into `LogZone.tsx` if it currently lives in App.tsx
- Ensure the entry list container has the correct scroll behavior (no overflow:hidden)

## Out of Scope

- Entry card redesign (already done in P0 pre-work)
- Entry fetching or data logic
- Any animation (Phase 08)

## Files Expected to Change

```
frontend/src/components/LogZone.tsx     (add entry list container + existing list)
frontend/src/pages/App.tsx              (remove entry list if it was there)
```

## Architecture Constraints

- No new data fetching in this task — wire the existing hook or prop down
- Entry list container: no `max-height`, no overflow clipping

## Acceptance Criteria

1. Entry list renders inside LogZone
2. Entries are visible and scroll with the page (not independently)
3. Build passes

## Estimated Complexity

S — <1 hour. Move existing rendering into the new component.

## Claude Execution Guidance

Find where the entry list currently renders in App.tsx. Move that JSX into LogZone.tsx. Update App.tsx to render `<LogZone>` with any required props. Build.
