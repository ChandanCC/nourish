# Documentation Conventions

Rules for writing, updating, and referencing `.plan/` files.

---

## Canonical Source Table

One file owns each concept. If the same fact appears in two files, one is wrong. Cross-reference; never duplicate.

| Concept | Canonical File |
|---|---|
| Color values, semantic roles, prohibited patterns | `design-system/tokens/colors.md` |
| Typography scale, font weights, usage rules | `design-system/tokens/typography.md` |
| Spacing values, named tokens | `design-system/tokens/spacing.md` |
| Surface treatments, borders, elevation, radius | `design-system/tokens/surfaces.md` |
| Opacity values, semantic hierarchy | `design-system/tokens/opacity.md` |
| Product philosophy, immutable principles | `product/core-principles.md` |
| SIGNAL semantics — STATE definitions, DELTA formula, PATTERN rules | `product/signal-system.md` |
| SIGNAL state machine — valid states, transitions, triggers | `product/signal-states.md` |
| Key term definitions — SIGNAL, STATE, DELTA, READING, etc. | `product/glossary.md` |
| Home screen — zone layout, hierarchy, scroll behavior | `design-system/home-screen.md` |
| Animation contracts, easing values | `design-system/motion-system.md` |
| Visual design overview, principles | `design-system/visual-language.md` |
| Per-component implementation spec | `design-system/components/<name>.md` |
| Backend services, APIs, write/read pipelines | `engineering/backend-architecture.md` |
| SIGNAL computation algorithms, thresholds, tiers | `engineering/intelligence-architecture.md` |
| Entity model, data schemas, event cascade | `engineering/data-architecture.md` |
| Claude prompts, output contracts | `engineering/ai-behavior.md` |
| Current tech stack choices | `engineering/stack.md` |
| What engineering cannot change | `engineering/constraints.md` |
| Onboarding flow, activation, day-by-day experience | `ux/onboarding-system.md` |
| All interaction behaviors | `ux/interaction-contracts.md` |
| Absence philosophy, empty state patterns | `ux/empty-states.md` |
| Current implementation status | `PROJECT_STATE.md` |
| Append-only decision history | `DECISION_LOG.md` |
| Full rationale for each decision | `decisions/NNN-*.md` |
| Writing and update rules for this system | `CONVENTIONS.md` |
| Directory map, role-based reading paths | `README.md` |
| AI session loading order and behavior rules | `SESSION_PROTOCOL.md` |

---

## Writing Rules

**Be precise, not comprehensive.**
One correct sentence is worth ten vague paragraphs. Every line must earn its place.

**Explain the WHY, not the WHAT.**
The code and the design show what. These docs explain why — the constraint, the tradeoff, the reasoning that isn't visible in the artifact.

**Separate immutable from evolving.**
Every spec file has an `## Immutable` section (principles that cannot change without a founding-level decision) and an `## Evolving` section (decisions that may update as the product matures).

**No duplicate knowledge.**
If something is defined in `design-system/tokens/colors.md`, reference it there. Do not restate it in a component spec. Cross-reference with a relative path link.

---

## File Update Rules

**When a design decision changes:**
1. Update the relevant spec file.
2. Log the change in `decisions/` with a new ADR (Architecture Decision Record).
3. Update any cross-referencing files.
4. Do not delete the previous decision — move it to the ADR as "Superseded reasoning."

**When a new component is added:**
1. Create `/design-system/components/<name>.md`.
2. Add it to `README.md` directory map.
3. Link to relevant design tokens by reference, not by restating values.

**When a future idea matures into a decision:**
1. Move it from `future/` to the appropriate spec file.
2. Log it in `decisions/`.
3. Delete or archive the future-ideas entry.

---

## Naming Conventions

**Files:** `kebab-case.md`. No spaces. No camelCase.

**Decision records:** `NNN-short-description.md` where NNN is zero-padded sequential number (001, 002...).

**Section headers:** `## Title Case` for major sections. `### Title Case` for subsections.

**Token names in docs:** `CATEGORY-VARIANT` in ALL_CAPS. Example: `BG-0`, `INK-2`, `STATUS-UP`.

**Component names in docs:** `PascalCase`. Example: `EntryCard`, `CommandBar`, `SignalHero`.

---

## Decision Record Format

```markdown
# NNN — Decision Title

**Date:** YYYY-MM-DD
**Status:** Active | Superseded | Proposed
**Supersedes:** NNN (if applicable)

## Decision
One sentence. What was decided.

## Context
Why this decision was needed. What problem it solves.

## Reasoning
The specific arguments that led to this decision.

## Tradeoffs
What was sacrificed. What remains a risk.

## Superseded by
NNN — Title (if later superseded)
```

---

## Cross-Reference Format

When referencing another file:
```
→ See: design-system/tokens/colors.md#ink-family
→ See: decisions/003-signal-not-score.md
```

When referencing a specific token:
```
Uses: INK-2, BG-1, STATUS-UP
→ Values: design-system/tokens/colors.md
```

---

## AI Session Integration Protocol

At the start of any design or product session:
1. Load `product/core-principles.md` for constraints.
2. Load the relevant spec file(s) for the topic.
3. After decisions are made, update the relevant files.
4. Log any new architectural decisions in `decisions/`.

At the end of any session that produced decisions:
1. All new decisions → logged as ADRs in `decisions/`.
2. Updated specs → versioned with "Last updated" date.
3. New components → new files in `design-system/components/`.
4. New future ideas → new files in `future/`.

**The system should never require a human to manually reconcile conflicting docs.**
If a conflict exists, the newer ADR wins. The older spec is updated to match.

---

## What Does Not Belong Here

- Implementation code or pseudocode (goes in the codebase)
- Meeting notes or chat logs (distill decisions from them, discard the rest)
- Exploration / brainstorming (future/ only after they've crystallized)
- Marketing copy or go-to-market strategy
- Personal opinions without reasoning attached
