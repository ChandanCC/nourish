# Documentation Conventions

Rules for writing, updating, and referencing `.plan/` files.

---

## Writing Rules

**Be precise, not comprehensive.**
One correct sentence is worth ten vague paragraphs. Every line must earn its place.

**Explain the WHY, not the WHAT.**
The code and the design show what. These docs explain why — the constraint, the tradeoff, the reasoning that isn't visible in the artifact.

**Separate immutable from evolving.**
Every spec file has an `## Immutable` section (principles that cannot change without a founding-level decision) and an `## Evolving` section (decisions that may update as the product matures).

**No duplicate knowledge.**
If something is defined in `design-tokens/colors.md`, reference it there. Do not restate it in a component spec. Cross-reference with a relative path link.

---

## File Update Rules

**When a design decision changes:**
1. Update the relevant spec file.
2. Log the change in `decisions/` with a new ADR (Architecture Decision Record).
3. Update any cross-referencing files.
4. Do not delete the previous decision — move it to the ADR as "Superseded reasoning."

**When a new component is added:**
1. Create `/component-specs/<name>.md`.
2. Add it to `README.md` directory map.
3. Link to relevant design tokens by reference, not by restating values.

**When a future idea matures into a decision:**
1. Move it from `future-ideas/` to the appropriate spec file.
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
→ See: design-tokens/colors.md#ink-family
→ See: decisions/003-signal-not-score.md
```

When referencing a specific token:
```
Uses: INK-2, BG-1, STATUS-UP
→ Values: design-tokens/colors.md
```

---

## AI Session Integration Protocol

At the start of any design or product session:
1. Load `core-principles.md` for constraints.
2. Load the relevant spec file(s) for the topic.
3. After decisions are made, update the relevant files.
4. Log any new architectural decisions in `decisions/`.

At the end of any session that produced decisions:
1. All new decisions → logged as ADRs in `decisions/`.
2. Updated specs → versioned with "Last updated" date.
3. New components → new files in `component-specs/`.
4. New future ideas → new files in `future-ideas/`.

**The system should never require a human to manually reconcile conflicting docs.**
If a conflict exists, the newer ADR wins. The older spec is updated to match.

---

## What Does Not Belong Here

- Implementation code or pseudocode (goes in the codebase)
- Meeting notes or chat logs (distill decisions from them, discard the rest)
- Exploration / brainstorming (future-ideas/ only after they've crystallized)
- Marketing copy or go-to-market strategy
- Personal opinions without reasoning attached
