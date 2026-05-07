# Working with AI in This Repository

This file explains how Claude (and any AI assistant) is configured to work in this codebase, and how to work with it effectively.

---

## How This Repository Is Structured for AI

This repository uses a **product intelligence system** in `.plan/` that gives every AI session full context about the product — its philosophy, design system, architecture decisions, current state, and rules that must never be broken.

Every Claude session in this repository loads `CLAUDE.md` first, which defines:
- What the product is
- What the design system rules are
- What the engineering constraints are
- How to handle decisions and uncertainty

You do not need to re-explain the product in every session. Claude will have loaded the relevant context.

---

## The `.plan/` Directory

```
.plan/
├── CLAUDE.md (root — primary operating doc)
├── PROJECT_STATE.md        "where are we right now"
├── SESSION_PROTOCOL.md     "how Claude should operate"
├── DECISION_LOG.md         "what decisions were made and why"
├── core-principles.md      "the product constitution — immutable"
├── signal-system.md        "the SIGNAL system spec"
├── home-screen.md          "home screen architecture"
├── visual-language.md      "design system overview"
├── motion-system.md        "animation contracts"
├── design-tokens/          "exact values for every design token"
├── component-specs/        "per-component implementation specs"
├── decisions/              "architectural decision records (ADRs)"
├── product/                "positioning, roadmap, competitive analysis"
├── engineering/            "stack, constraints, AI behavior"
├── ux/                     "interaction contracts, onboarding, empty states"
└── future-ideas/           "deferred features with design constraints"
```

---

## Starting a New Session

Tell Claude what you want to accomplish. It will load the relevant context from `.plan/` automatically.

For complex sessions, you can explicitly prompt:
> "Load the project state and [describe what you want to do]."

For implementation sessions:
> "Implement the EntryCard redesign per the spec."
— Claude will read `.plan/component-specs/entry-card.md` before writing code.

---

## Rules for Working With Claude Here

### What Claude will refuse (or flag)
- Introducing color-coded macros or rainbow palette elements
- Adding tab bar navigation
- Adding gamification (streaks, badges, celebrations)
- Adding glassmorphism or box-shadows
- Adding decorative animations without a stated purpose
- Calling the Anthropic API from frontend code
- Writing `any` types in TypeScript without comment

If Claude flags a conflict, it's because a rule in `CLAUDE.md` or `.plan/core-principles.md` applies. The right response is to read the relevant spec, not to override the flag.

### What Claude will not do unprompted
- Re-explain the product philosophy (you know it)
- Add features beyond the task scope
- Create documentation files (unless asked)
- Add comments to obvious code

### Updating project state
After implementing a feature, ask Claude to:
> "Update PROJECT_STATE.md to reflect [what was completed]."

This keeps the state file accurate for future sessions.

---

## Key Files to Read as a New Team Member

If you're new to this project:

1. `CLAUDE.md` — what Claude knows and how it's configured
2. `.plan/core-principles.md` — the product's constitution
3. `.plan/signal-system.md` — the core product concept
4. `.plan/home-screen.md` — the primary surface
5. `.plan/visual-language.md` — the design system

That reading path takes ~15 minutes and gives you 80% of the context for any decision.

---

## Maintaining the System

### When a decision is made in a session
Claude should append it to `.plan/DECISION_LOG.md`. If it's significant enough, create a formal ADR in `.plan/decisions/`.

### When a feature ships
Update `.plan/PROJECT_STATE.md`. Mark the item as completed. If the implementation diverged from the spec, update the component spec to match reality.

### When a rule in CLAUDE.md needs to change
That is a product-level decision. Add a new ADR. Update `CLAUDE.md`. Note the date and reason. Do not quietly edit rules without a record.

### When `.plan/` files become stale
The files are only useful if they reflect reality. If an implementation contradicts a spec, fix the spec or fix the implementation — don't leave them inconsistent.

---

*This file is for human team members. `CLAUDE.md` is the AI-facing equivalent.*
