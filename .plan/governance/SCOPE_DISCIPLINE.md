# Scope Discipline

**Status:** Active
**Last updated:** 2026-05-07

The principal risk in any implementation session is doing more than the task requires. This document defines how tasks stay atomic, how scope is controlled, and how adjacent ideas are deferred without being lost.

---

## The Atomic Task Rule

One task = one spec section = one commit domain.

**Correctly scoped task:** "Implement the four-zone layout for the home screen per `design-system/home-screen.md#zone-layout`"

**Incorrectly scoped task:** "Implement the home screen" (too broad) or "Implement the home screen and while there, fix the typography and also add the command bar focus state" (scope bleed).

If a task cannot be summarized in one sentence without "and", it needs to be split.

---

## How to Stay Narrow

**Before starting:** Read only the spec for the current task. Do not read adjacent specs. Reading the motion system spec while implementing layout creates the temptation to add animations that aren't in scope.

**During implementation:** If you notice something that should be changed in adjacent code, write it down in a "deferred" list. Do not change it. Finish the current task first.

**After completing:** Review the deferred list. Create explicit follow-up tasks for each item. None of them were done in this task.

---

## Adjacent Feature Creep Patterns

### The "While I'm Here" Pattern

**Description:** Discovering an adjacent improvement while implementing a feature and implementing it on the same pass.

**Example:** Implementing P1 (home screen layout) and "while I'm here" adding P5 (command bar focus state) because the command bar code is open.

**Why it's harmful:**
- P5 is not tested in the context of P1's task scope
- If P1 is reverted, P5 goes with it
- The commit history becomes unreadable
- P5 may have its own dependencies not yet satisfied

**Rule:** If it's not in the current task spec, it is not in the current commit.

---

### The "This Is Easy" Pattern

**Description:** Identifying a small adjacent task and doing it because it seems trivial.

**Example:** "Typography is wrong everywhere but I'm only supposed to touch the hero zone. It would only take 5 minutes to fix it all."

**Why it's harmful:**
- "5 minutes" is never 5 minutes
- Typography changes touch many files — unexpected regressions
- Not in scope = not in test coverage for this session
- Prevents clean, reviewable commits

**Rule:** Small does not mean in-scope. Create a follow-up task.

---

### The "I See a Better Architecture" Pattern

**Description:** Noticing a better architectural pattern while implementing and starting to refactor the architecture mid-feature.

**Example:** Implementing the SIGNAL hero component and realizing the state management pattern could be better, starting to refactor it.

**Why it's harmful:**
- Architectural changes are high-risk and require architectural review
- Mixing feature implementation with architecture refactors makes debugging impossible
- Architectural insights during implementation are valuable — but they are inputs to a planning decision, not a license to act immediately

**Rule:** Note the architectural observation. Complete the feature. Open an architectural discussion. Implement the refactor as a separate, planned task.

---

## When to Create Follow-Up Tasks

Create a follow-up task when:
- You notice a bug in code you're not touching
- You notice a design inconsistency in an adjacent component
- You identify a performance improvement in adjacent code
- You realize the current spec is missing a case you'll need to handle in a future task
- You want to refactor something that works but is messy

Document follow-up tasks in `PROJECT_STATE.md` under Technical Debt or in the relevant pending section. Never in a comment in the code ("// TODO: fix this").

---

## How to Defer Safely

An idea deferred to a comment is likely to be forgotten. An idea captured in `PROJECT_STATE.md` is likely to be addressed. An idea captured in `future/` is intentionally preserved but deprioritized.

**Where to put deferred ideas:**

| Type | Where |
|---|---|
| Bug in current code, not blocking | `PROJECT_STATE.md#technical-debt` |
| Enhancement to feature being built | Append to the relevant P-item in PROJECT_STATE.md |
| New feature idea | `future/` (after checking it doesn't belong in a current spec) |
| Architectural improvement | Add to the Unresolved Decisions section in `PROJECT_STATE.md` |
| Spec gap discovered | Update the spec file with a `TODO:` section |

---

## How to Avoid Architecture Bleed

Architecture bleed is when a feature implementation changes how the system fundamentally works, rather than adding to it.

**Examples of architecture bleed:**
- Implementing a SIGNAL component that requires a new data query the backend doesn't support
- Implementing a motion system that requires a new React context/provider the app doesn't have
- Implementing an AI feature that changes when and how the AI is called

**Rule:** If implementing the feature requires changing the architecture, stop. Define the architectural change. Get alignment. Implement the architectural change first as a separate task. Then implement the feature.

---

## Speculative Abstractions

**Prohibited:** Abstractions that anticipate features not yet in scope.

**Examples:**
- Creating a `useSignalData` hook that also handles training data "for when training is implemented"
- Building a component with 12 configurable props "for future flexibility"
- Writing a utility function that handles 5 cases when only 1 case exists now

**The rule:** Three concrete uses justify an abstraction. One use does not. Two uses might.

If a future use is hypothetical (it's in `future/` or not yet in the roadmap), it does not count toward the three-use threshold.

---

## Scope Boundaries for the v1.1 Implementation Queue

Each P-item is self-contained. P-items are not additive within a single implementation session.

| P-item | Touches | Does NOT touch |
|---|---|---|
| P1 — Home Screen Layout | Zone structure, scroll behavior | SIGNAL computation, motion, typography system |
| P2 — SIGNAL Hero | Hero component, collapsed strip | Waveform (P3), computation (P7) |
| P3 — Waveform | Waveform rendering, day selection | SIGNAL computation, state management |
| P5 — Command Bar | Focus state, scrim, gradient | Layout (P1) |
| P6 — Typography | Font loading, utility class application | Colors, spacing, components |
| P7 — SIGNAL Computation | Backend services, intelligence algorithms | Frontend display (handled in P2/P3) |
| P8 — Motion System | Animation implementation | Layout, component logic |
| P9 — Onboarding | 3-screen flow, READING state display | SIGNAL computation (P7 must be done) |

If a P-item implementation requires touching a "Does NOT touch" area, surface it as a dependency or spec gap — not an expansion.

---

## Implementation Calmness

The goal of scope discipline is not bureaucracy — it is calm implementation. A session where the scope is clear produces clean commits, readable diffs, and a codebase that remains comprehensible.

A session where scope is unclear produces:
- Large PRs that are impossible to review
- Mixed-concern commits that are impossible to revert safely
- Regressions in features that "weren't touched"
- A codebase that feels chaotic

Finish narrowly. The next task will handle the next thing.

---

*Scope discipline is what allows individual sessions to compound into a coherent product.*
*Every task that finishes cleanly is an architectural deposit. Every scope bleed is a withdrawal.*
