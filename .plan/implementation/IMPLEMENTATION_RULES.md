# Implementation Rules

**Task-system specific rules for Nouriq v1.1 implementation.**
**Last updated:** 2026-05-07

This file complements `.plan/IMPLEMENTATION_RULES.md` (general rules) with task-system specific guidance. When in conflict, the general file governs.

---

## The Minimal Change Rule

Every task changes the minimum number of files necessary to satisfy its acceptance criteria. More files changed = more risk of unintended side effects.

Before changing a file that's not in the task's "Files Expected to Change" list:
1. Is this change required for the acceptance criteria?
2. If yes: add it to the task scope explicitly (document why)
3. If no: do not make the change

---

## Component Implementation Sequence

When implementing a new component, follow this order:
1. Define the TypeScript interface/props first
2. Implement the static/layout version (no data, hardcoded values)
3. Verify layout and style match spec with `npm run dev`
4. Wire data (connect props, hooks)
5. Handle loading/error/empty states
6. Handle edge cases

Never jump from interface to wired implementation. The static step catches layout/style errors cheaply.

---

## Backend Service Implementation Sequence

When implementing a new backend service:
1. Define the TypeScript function signature first (inputs → outputs)
2. Write the happy-path implementation
3. Write the error/edge case handling
4. Write a fixture test to verify the happy path
5. Write fixture tests for edge cases
6. Integrate into the route handler

Never integrate a service into a route before the service is independently verified with fixtures.

---

## Type Contract Rule

Any data that crosses the frontend–backend boundary must have an explicit TypeScript type on both sides. The type must be identical (or one must import from the other).

Current shared types needed:
- `HomeScreenPayload` (defined in P04-006, consumed in P07-001)
- `SignalStateValue` (the string enum of STATE values)
- `FoodEntry` response type

Create a shared types approach: define the canonical type in one place and ensure both sides reference it consistently.

---

## Fixture-First Rule for Intelligence Tasks

For all tasks in Phase 05 (intelligence engine), create a fixture file before implementing:

```
backend/src/services/intelligence/__tests__/fixtures/
  tier1.fixtures.ts    — input/output pairs for Tier 1 functions
  tier2.fixtures.ts    — input/output pairs for Tier 2 functions
```

A fixture looks like:
```typescript
export const readingStateTrigger = {
  input: { loggedDaysInLast14: 2, baselineEstablished: false, accountAgeDays: 10 },
  expected: { isReading: true }
};
```

Fixtures serve as: documentation of expected behavior, regression tests, and proof that the algorithm is correct before it's integrated.

---

## State Management Rule

The frontend uses TanStack Query for server state. Do not introduce additional state management (Zustand, Jotai, Redux) for the v1.1 implementation.

Local component state: `useState` / `useReducer`
Server state: TanStack Query hooks
Cross-component UI state (e.g., selected waveform day): `useState` in the nearest common ancestor component, passed as props

For waveform day selection, the selected day state lives in the page-level component that renders both Waveform and TodayZone.

---

## API Conventions

All new API routes follow this pattern:

```typescript
// Route handler structure
router.get('/resource', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.sub;
    const result = await service.doThing(userId);
    res.json(result);
  } catch (error) {
    logger.error('route:resource:get', { error });
    res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
```

Rules:
- All handlers are async
- All errors are caught and return structured `{ error, code }` responses
- No stack traces in error responses
- All user-scoped queries extract `userId` from `req.user.sub`

---

## MongoDB Query Rules

1. Every query includes `{ userId }` filter for user-scoped collections
2. Use projection (`{ field: 1 }`) to limit returned fields when full documents aren't needed
3. Indexes must exist before queries run in production — add indexes in model file

Required indexes (add to model files):
- `logs`: `{ userId: 1, date: -1 }`, `{ userId: 1, deleted_at: 1 }`
- `dayaggregates`: `{ userId: 1, date: -1 }` (unique)
- `signalstates`: `{ userId: 1, computed_at: -1 }`
- `baselinesnapsots`: `{ userId: 1, created_at: -1 }`

---

## CSS and Styling Rules

No new CSS is written outside of:
1. `frontend/src/index.css` — for utility classes and CSS custom properties only
2. Inline `style={{ }}` — only when a value is dynamic (e.g., `style={{ width: `${pct}%` }}`)

All other styling via Tailwind utility classes referencing the design token color names.

When a component needs a complex style that doesn't fit Tailwind: add a utility class to `index.css`, not a component-level CSS file.

---

## Motion Implementation Rules

All animations:
1. Use CSS transitions or `@keyframes` — not JavaScript timers
2. Use `transform` and `opacity` only — not layout-affecting properties
3. Use easing values from `design-system/motion-system.md`
4. Have a named purpose (document in comment if not obvious from the animation name)

JavaScript-driven animation (for number counting): use `requestAnimationFrame` with linear interpolation. No animation library dependencies.

---

## Error Handling Philosophy

**Frontend:** Components receive data from TanStack Query. On error state: the component renders nothing (absent = correct per UX invariant). Do not show error messages in the UI for data-fetch failures. The exception: if a user action fails (save food entry), show a brief status indicator.

**Backend:** All route handlers catch errors and return structured responses. AI call failures return the deterministic fallback — never a 500. Database errors return a 503 after logging.

---

## Definition of Phase Complete

A phase is complete when:
1. Every task in the phase is COMPLETE in TASK_REGISTER.md
2. `npm run build` passes with 0 errors for affected packages
3. The milestone associated with the phase (if any) is achieved
4. The visual/functional state matches the phase output description in MASTER_ROADMAP.md

A phase is **not** complete when:
- Some tasks are COMPLETE but others are BLOCKED
- The build passes but known acceptance criteria failures exist
- Documentation hasn't been updated

---

## Commit Strategy

One commit per task. The commit message format:

```
{type}({phase-slug}): {one-line description}

- acceptance criterion 1 met
- acceptance criterion 2 met

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Type choices: `feat` (new behavior), `fix` (bug fix), `refactor` (structural change, no behavior change), `style` (visual changes), `chore` (tooling/config)

Phase slug examples: `layout`, `display`, `command-bar`, `backend-data`, `intelligence`, `ai-synthesis`, `integration`, `motion`, `onboarding`, `hardening`

---

*These rules exist in addition to, not instead of, `.plan/IMPLEMENTATION_RULES.md`.*
