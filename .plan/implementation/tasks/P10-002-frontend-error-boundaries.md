# P10-002 — Frontend Error Boundaries

**Phase:** 10 — Observability & Hardening
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P07-001
**Unlocks:** (hardening complete)

---

## Purpose

Wrap each zone component in a React error boundary so a runtime error in one zone does not crash the entire app.

## Why It Exists

A JavaScript error in `SignalZone` should not prevent the user from seeing their `LogZone`. Error boundaries provide graceful degradation.

## Required Reading

- Phase 10 phase file: `phases/phase-10-hardening.md#error boundaries` — fallback spec

## Exact Scope

- Create `frontend/src/components/ErrorBoundary.tsx` (class component — required by React)
- Fallback: `null` (the zone disappears silently — "absence is a design choice")
- Wrap in HomeScreen.tsx:
  ```tsx
  <ErrorBoundary><SignalZone /></ErrorBoundary>
  <ErrorBoundary><TodayZone /></ErrorBoundary>
  <ErrorBoundary><LogZone /></ErrorBoundary>
  ```

## Design-System Constraints

- Fallback is `null` — no error message, no retry button, no "something went wrong" text
- This matches `architecture/ARCHITECTURE_INVARIANTS.md` principle: absent data = absent UI

## Acceptance Criteria

1. A runtime error inside SignalZone renders nothing (not a crash screen)
2. TodayZone and LogZone continue rendering when SignalZone errors
3. Build passes

## Estimated Complexity

S — <1 hour.

## Claude Execution Guidance

React error boundaries must be class components. Minimal implementation: `componentDidCatch` to log the error, `render()` returns `this.props.children` or `null` based on `this.state.hasError`. Wrap all three zones in HomeScreen.tsx.
