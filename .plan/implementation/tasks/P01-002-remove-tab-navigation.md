# P01-002 — Remove Tab Navigation

**Phase:** 01 — Frontend Layout Foundation
**Complexity:** S (<1h)
**Status:** NOT_STARTED
**Depends on:** P01-001
**Unlocks:** (nothing — cleanup task)

---

## Purpose

Delete all tab navigation code, state, and components from the frontend.

## Why It Exists

Tab navigation violates `decisions/007-no-tab-navigation.md` and `architecture/ARCHITECTURE_INVARIANTS.md#U-INV-05`. The four-zone scaffold (P01-001) replaces it structurally; this task removes the dead code.

## Required Reading

- `decisions/007-no-tab-navigation.md` — decision context

## Exact Scope

- Remove all tab bar components, tab state, tab switching logic
- Remove any imports that only exist to support tab navigation
- Remove any route configuration tied to tabs if present
- Delete any CSS classes or styles that only apply to the tab UI

## Out of Scope

- Any new functionality
- Styling the new zones (Phase 02)

## Files Expected to Change

```
frontend/src/pages/App.tsx              (remove tab state and tab rendering)
frontend/src/components/TabBar.tsx      (delete if exists)
frontend/src/components/WeekView.tsx    (delete if exists — week tab view)
```

*Actual files depend on current codebase. Identify by searching for tab-related JSX before deleting.*

## Architecture Constraints

- Hard delete only — no commented-out code, no `// TODO: remove`, no backwards-compat exports

## Runtime Constraints

- `npm run build -w frontend` must pass after deletion

## Acceptance Criteria

1. No tab bar renders anywhere in the app
2. No tab-related state variables remain in App.tsx
3. Build passes with 0 errors
4. `grep -r "tab" frontend/src --include="*.tsx" --include="*.ts" -i` returns only unrelated matches (e.g., `tabIndex` for accessibility)

## Failure Cases

- Build error because something references the deleted tab component → find that reference and remove it too

## Test Expectations

None. Visual check: no tab bar visible.

## Risks

- Some component outside the tab system may import from a deleted file

## Estimated Complexity

S — <1 hour. Search and delete.

## Claude Execution Guidance

Use `grep` to find all tab-related imports and state before deleting. Delete the component files first, then remove their references in App.tsx. Build to confirm no broken imports remain.
