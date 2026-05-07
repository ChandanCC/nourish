# AI Session Rules

**Status:** Active
**Last updated:** 2026-05-07

Rules governing how Claude sessions should behave in this repository. These rules exist to prevent context loss, architectural drift, scope bleed, and compounding inconsistency across sessions.

Every session that follows these rules inherits the discipline of previous sessions. Every session that deviates degrades the coherence that previous sessions built.

---

## Context Restoration Order

Every session begins with context restoration. This is not optional. A session that skips restoration will re-make decisions already made and introduce inconsistencies that require later remediation.

**Minimum required reading for any session:**
```
1. CLAUDE.md                        — Non-negotiables and session behavior rules
2. PROJECT_STATE.md                 — Current status and NEXT ACTION
3. SESSION_PROTOCOL.md              — How to operate in this session
4. product/core-principles.md       — Product constitution
```

**For implementation sessions, add:**
```
5. The component spec for what is being built
   (design-system/components/<name>.md)
6. The relevant token files if design work is involved
   (design-system/tokens/colors.md, typography.md)
```

**For SIGNAL/backend sessions, add:**
```
5. product/signal-system.md + product/signal-states.md
6. engineering/intelligence-architecture.md
7. engineering/backend-architecture.md
8. engineering/ai-behavior.md
```

**For architectural decisions, add:**
```
5. architecture/ARCHITECTURE_INVARIANTS.md
6. CONSTITUTION.md
7. DECISION_LOG.md (last 5 entries)
```

A session that jumps straight to implementation without reading context is a session that will drift.

---

## Implementation Discipline

**Do not implement more than the task requires.** The task is defined by the current P-item in `PROJECT_STATE.md` and its corresponding spec. Nothing else is in scope unless explicitly stated.

**Do not redesign architecture during implementation.** If an architectural concern is surfaced during implementation, record it and surface it to the user before acting on it. Architecture changes require alignment, not unilateral implementation.

**Do not silently resolve spec ambiguities.** If a spec is ambiguous about a detail, surface the ambiguity explicitly rather than guessing. A wrong implementation based on a wrong guess is worse than a 30-second question.

**Do not "improve" adjacent code.** If code outside the task scope looks wrong, note it. Do not change it. Create a follow-up entry in `PROJECT_STATE.md`.

**Do not introduce abstractions the task doesn't require.** Build what's needed now. See `governance/SCOPE_DISCIPLINE.md`.

---

## Scope Boundaries

Before starting any task, establish the scope boundary: which files are expected to change?

If files outside that boundary are changing:
1. Stop
2. Ask: is this necessary for the current task?
3. If yes: document why in the commit message
4. If no: revert and capture as a follow-up

The typical scope for a component implementation:
- `frontend/src/components/<ComponentName>.tsx` (new or modified)
- `frontend/src/pages/App.tsx` (if wiring the component into the page)
- `frontend/src/lib/` (if utility logic is needed)
- CSS in `frontend/src/index.css` only if adding new utility classes

Files outside this scope during a component implementation are a scope signal.

---

## When to Ask for Clarification

Ask before implementing when:
- The spec contains a contradiction
- An Unresolved Decision in `PROJECT_STATE.md` would be implicitly resolved by the implementation
- The implementation requires touching an invariant in `architecture/ARCHITECTURE_INVARIANTS.md`
- The implementation would add a new color, font, or token family
- The implementation would change the home screen navigation model
- The implementation requires backend changes not yet specified

Do not ask when:
- The spec is clear and complete
- The decision has already been made and logged
- The question is answerable by reading the existing documentation

The principle: ask about decisions, not about information that's already in the docs.

---

## When NOT to Redesign Architecture

Do not redesign or suggest redesigning architecture when:
- Implementing a feature that is already fully specified
- Fixing a bug in existing code
- The current architecture is working but "could be cleaner"
- The session context doesn't have full architectural context loaded

Do surface architectural concerns when:
- A spec cannot be implemented without violating an invariant
- An implementation reveals that the architecture is inadequate for a stated requirement
- A pattern is being introduced that would be architecturally significant if repeated

The distinction: surfacing a concern is good. Unilaterally redesigning mid-session is not.

---

## When to Preserve Existing Decisions

Preserve existing decisions when:
- A decision is documented in `DECISION_LOG.md` or `decisions/`
- The rationale for the decision is clearly stated and still valid
- The implementation merely needs to follow the decision, not revisit it

Do not relitigate decided questions. If a decision needs to change, that is a product discussion — not an implementation session.

---

## How to Update Documentation Safely

Documentation updates are part of every implementation session. They are not optional.

**After completing an implementation task:**
1. Mark the P-item in `PROJECT_STATE.md` as complete
2. Update `PROJECT_STATE.md#next-action` to point to the next task
3. If implementation diverged from spec: update the spec to match, with a note on why
4. If a new decision was made: add to `DECISION_LOG.md`
5. If new technical debt was introduced: add to `PROJECT_STATE.md#technical-debt`

**Never update documentation to make it match a wrong implementation.** The spec is the intended behavior. If implementation differs, either fix the implementation or explicitly decide to change the spec and document why.

---

## How to Maintain Consistency Across Long Timelines

This codebase will be maintained across many sessions, some after long gaps. Consistency across sessions requires:

**Naming consistency:** Component names, variable names, API route names, TypeScript type names must match the spec vocabulary exactly. See `product/glossary.md`.

**Pattern consistency:** If a pattern was used in one component (e.g., how progress bars are implemented in EntryCard), use the same pattern in similar components. Before implementing, read a related component to understand the existing pattern.

**Token consistency:** Never introduce a local color value because the token system doesn't have exactly what's needed. If a new token is needed, add it to the token file.

**Commit message consistency:** Follow the conventional commits format: `type(scope): description`. Types: feat, fix, refactor, style, docs, chore, test.

---

## High-Risk Modification Zones

These areas of the codebase are high-risk because errors here affect the entire product or are difficult to reverse:

| Zone | Risk | Precaution |
|---|---|---|
| `frontend/src/index.css` (CSS custom properties) | All components depend on these | Test all components after any token change |
| `backend/src/routes/analyse.ts` | AI proxy — cost + security risk | Never expose API key; validate all inputs |
| SIGNAL computation logic | Trust-critical | Always verify against `engineering/intelligence-architecture.md` |
| `FoodEntry` schema | Immutability invariant | No edit operations — soft-delete only |
| `SignalState` document | Historical preservation | No in-place updates — new document per state |
| Auth middleware (`requireAuth`) | All API security | Full regression test after any change |
| `tailwind.config.js` | Design token system | Changes affect all styled components |

---

## Protected Architectural Systems

These systems must not be modified without explicit architectural review:

1. **The sync/async boundary** — DayAggregate sync, SIGNAL async. See `decisions/009`.
2. **The SIGNAL fallback chain** — Tier 1 → Tier 2 → Tier 3 → deterministic fallback. See `decisions/011`.
3. **The API proxy architecture** — All AI calls through backend. See `decisions/005`.
4. **The two-function Lambda topology** — api-handler / job-worker split. See `decisions/008`.
5. **The pre-computed document model** — DayAggregate, SignalState, BaselineSnapshot. See `decisions/010`.
6. **The FoodEntry immutability model** — soft-delete only. See `architecture/ARCHITECTURE_INVARIANTS.md#D-INV-01`.
7. **The monochromatic palette** — BG/INK/GOLD/STATUS only. See `decisions/006`.

---

## Requires-Human-Confirmation Changes

Stop and ask the user before proceeding with:
- Adding a new chromatic color not in the current token system
- Adding navigation structure (tabs, drawer, bottom nav)
- Changing when and how AI synthesis is triggered
- Changing the SIGNAL computation algorithm
- Adding a new database index or collection
- Adding a new Lambda function or AWS service
- Modifying the onboarding flow after v1.1 spec is implemented
- Any change that would violate an invariant in `architecture/ARCHITECTURE_INVARIANTS.md`

---

## Token Optimization Behavior

In long sessions, context window pressure can create shortcuts. The following are not acceptable shortcuts:

- Reading only part of a spec to save tokens
- Implementing based on memory of a spec without re-reading it
- Skipping the implementation review checklist to save time
- Omitting documentation updates because "it's already in the commit message"
- Using raw hex values because looking up the token would take an extra step

If context is full, it is better to start a fresh session with proper context loading than to continue a degraded session that will produce inconsistent work.

---

*These rules exist because good systems degrade through accumulated small violations.*
*The discipline of following them in every session is what maintains coherence over time.*
