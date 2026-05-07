# P07-002 — SIGNAL Hero Connected to Real Data

**Phase:** 07 — Frontend–Backend Integration
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P07-001, P02-002
**Unlocks:** P08-001, P09-006

---

## Purpose

Wire the `SignalHero` component to receive real SIGNAL state data from the `useHomeScreen` hook.

## Why It Exists

SignalHero was built with static data in P02-002. This task replaces the hardcoded props with live data from the home screen payload.

## Exact Scope

- In `SignalZone.tsx`: call `useHomeScreen()`, extract `signal` field
- Pass signal data as props to `SignalHero`:
  ```typescript
  <SignalHero
    state={data.signal.state}
    subtitle={data.signal.subtitle}
    delta={data.signal.delta}
    isCollapsed={isCollapsed}
  />
  ```
- If `data` is undefined (loading/error): pass `state="READING"`, null for subtitle/delta
- `isCollapsed` state remains in SignalZone (from P02-004 observer)

## Out of Scope

- SIGNAL state computation (backend)
- Animation (Phase 08)

## Files Expected to Change

```
frontend/src/components/SignalZone.tsx  (add useHomeScreen, pass signal props)
```

## Architecture Constraints

- The hook call lives at the zone level (SignalZone), not inside SignalHero
- SignalHero remains a pure component (no hooks inside)

## Acceptance Criteria

1. SignalHero renders the state string from the backend (not "READING" hardcode)
2. When backend returns READING, component correctly shows READING
3. When backend returns BUILDING, component correctly shows BUILDING
4. Build passes

## Estimated Complexity

M — ~1 hour. Mostly wiring.

## Claude Execution Guidance

Move `useHomeScreen()` call to SignalZone.tsx. Destructure the `signal` field. Pass props to SignalHero. Remove the hardcoded static values.
