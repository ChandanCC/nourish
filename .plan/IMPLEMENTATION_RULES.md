# Implementation Rules

**Status:** Active
**Last updated:** 2026-05-07

Practical rules for every implementation session. These are the habits that prevent the architectural and visual rules from being aspirational.

Read `CONSTITUTION.md` for philosophy. Read `architecture/ARCHITECTURE_INVARIANTS.md` for invariants. This file covers how to implement, not what to implement.

---

## Before Any Implementation Task

1. **Read the spec.** The relevant spec in `design-system/components/` or `engineering/` is the contract. If the spec doesn't exist, write it before implementing.

2. **Establish the scope boundary.** Which files are expected to change? Write them down. If anything else changes, it needs justification.

3. **Check the Unresolved Decisions.** Read `PROJECT_STATE.md#unresolved-decisions`. If the task touches one, resolve it explicitly before proceeding.

4. **Verify the task is unblocked.** If the task has dependencies listed in `PROJECT_STATE.md`, confirm they are complete.

---

## Frontend Rules

### Components

- Every component has a corresponding spec in `design-system/components/` — read it before touching the component.
- Component names must match spec names exactly: `EntryCard`, `SignalHero`, `CommandBar`, `Waveform`.
- No component imports a hardcoded color. All colors via CSS custom properties.
- Props must be TypeScript-typed. No `any` prop types.
- Components do not fetch data. Data comes from TanStack Query hooks in the page or a parent component.

### Styling

- All colors via CSS custom properties (`var(--bg-0)`, `var(--ink-2)`, etc.)
- All type sizes via utility classes (`.text-display`, `.text-label`, etc.)
- All spacing via Tailwind scale (multiples of 4: `p-4`, `gap-3`, etc.) or named token classes
- No Tailwind arbitrary values: `text-[13px]`, `p-[7px]`, `h-[48px]` — use scale values
- No `style={{ ... }}` with raw hex values — use CSS custom properties if inline style is needed
- No `box-shadow` in any style
- No `backdrop-filter` (glassmorphism)

### Motion

- Every animation has a defined purpose. If you cannot state the purpose in one sentence, remove the animation.
- Only easing values from `design-system/motion-system.md`.
- Animate `transform` and `opacity` only — not `width`, `height`, `top`, `left`.
- No animations that run at rest (after the reveal sequence completes).
- Animation durations: see `design-system/motion-system.md` for each animation contract.

### TypeScript

- Strict mode: no suppression of TypeScript errors.
- No `as any`. If a type genuinely cannot be expressed: add a comment explaining why.
- Export types from the file that defines them. No re-exporting just to make imports convenient.
- Component prop types: inline interface in the same file.

---

## Backend Rules

### Routes

- All routes require `requireAuth` middleware unless explicitly public (health check only).
- Route handlers are thin — logic lives in `services/` or `jobs/`.
- AI calls happen in `services/ai/` or `jobs/` — never directly in route handlers.
- All user-scoped queries include `{ userId }` filter.

### Data Operations

- FoodEntry: `create` and soft-delete only. No update operations.
- DayAggregate: recomputed synchronously in the write path. Never read from raw logs in a GET handler.
- SignalState: written by the job-worker only. Never mutated — new document per state.
- BaselineSnapshot: append-only.

### AI Integration

- AI is always called with a pre-computed summary object, not raw documents.
- Output is validated before storage: state in candidate_states, instruction ≤ 120 chars.
- Deterministic fallback is always implemented alongside AI synthesis.
- All prompts live in `engineering/ai-behavior.md`. No prompts defined inline in routes.

### Error Handling

- Route handlers return structured error responses: `{ error: string, code: string }`.
- AI failures return a deterministic fallback, not a 500.
- MongoDB errors are caught and logged — not exposed to the client.
- No stack traces in production API responses.

---

## Documentation Rules

### What Gets Updated After Every Session

| If you... | Update... |
|---|---|
| Complete a P-item | `PROJECT_STATE.md` (mark done, update NEXT ACTION) |
| Make an architectural decision | `DECISION_LOG.md` + `decisions/NNN-*.md` |
| Change a component's behavior | The component spec in `design-system/components/` |
| Add technical debt | `PROJECT_STATE.md#technical-debt` |
| Change a token value | `design-system/tokens/` + `frontend/src/index.css` |
| Resolve an Unresolved Decision | Remove from `PROJECT_STATE.md`, add to `DECISION_LOG.md` |
| Violate an invariant (with justification) | `architecture/ARCHITECTURE_INVARIANTS.md` + `DECISION_LOG.md` |

### What Never Gets Updated Silently

- Spec files — if implementation differs from spec, either fix the implementation or update the spec explicitly with a reason.
- `ARCHITECTURE_INVARIANTS.md` — if an invariant is violated, it's a decision, not a quiet edit.
- `CONSTITUTION.md` — constitutional changes require explicit session-level alignment.

---

## Commit Rules

- Follow conventional commits: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`
- Scope: the area being changed (`components`, `backend`, `tokens`, `plan`, etc.)
- One logical change per commit. If it can't be explained in a one-line description, split it.
- Do not mix feature implementation and documentation updates in a single commit.
- Do not commit commented-out code.

---

## Definition of Done

A task is done when:
1. The implementation matches the spec (or the spec has been intentionally updated)
2. TypeScript compiles with no errors
3. The implementation review checklist in `governance/IMPLEMENTATION_REVIEW_CHECKLIST.md` passes
4. `PROJECT_STATE.md` is updated
5. Any new decisions are logged in `DECISION_LOG.md`
6. The commit is clean and descriptive

A task is **not** done when:
- TypeScript compiles but there are `any` types without documentation
- The implementation works but uses raw hex values
- The implementation works but doesn't match the spec
- The implementation works but PROJECT_STATE.md hasn't been updated

---

*These rules are habits. Habits compound. Each session that follows them makes the next session easier.*
