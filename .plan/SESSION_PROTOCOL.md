# Session Protocol

**This file defines how every Claude session in this repository should operate.**

Every session is a continuation of a running product. Context must be restored, not rebuilt.

---

## On Session Start — Required Reading

Read these files in order before doing any work. This takes under 2 minutes.

```
Step 1   CLAUDE.md                     — Rules and non-negotiables
Step 2   .plan/PROJECT_STATE.md        — Current progress and open decisions
Step 3   .plan/product/core-principles.md      — The product constitution
```

Then load task-specific context:

```
If working on UI/design:       .plan/design-system/visual-language.md
                               .plan/design-system/tokens/ (relevant file)
                               .plan/design-system/components/<component>.md

If working on SIGNAL/product:  .plan/product/signal-system.md
                               .plan/product/signal-states.md
                               .plan/design-system/home-screen.md

If working on backend/AI:      .plan/engineering/stack.md
                               .plan/engineering/constraints.md
                               .plan/engineering/backend-architecture.md
                               .plan/engineering/data-architecture.md
                               .plan/engineering/intelligence-architecture.md
                               .plan/engineering/ai-behavior.md

If making a product decision:  .plan/product/positioning.md
                               .plan/decisions/ (scan for conflicts)

If working on animation:       .plan/design-system/motion-system.md
```

**Never skip Step 1–3.** Task-specific context without foundational context produces drift.

---

## Authoritative Files — Never Contradict

These files define ground truth. Implementation deviates from them, not the other way around:

| File | Authority over |
|---|---|
| `CLAUDE.md` | All session behavior and non-negotiables |
| `.plan/product/core-principles.md` | Product and design philosophy — immutable |
| `.plan/design-system/tokens/colors.md` | All color values and semantic rules |
| `.plan/design-system/tokens/typography.md` | All font sizes, weights, usage rules |
| `.plan/design-system/tokens/spacing.md` | All spacing values |
| `.plan/design-system/tokens/surfaces.md` | All surface treatments, borders, radius |
| `.plan/design-system/motion-system.md` | All animation contracts |
| `.plan/design-system/components/<component>.md` | Per-component implementation spec |

If the codebase contradicts one of these files, **the spec is right and the code is wrong**. Fix the code.

If a spec has become genuinely stale (the product has moved), **update the spec with an explanation** before implementing the new behavior. Do not silently deviate.

---

## How to Restore Full Context

If starting a session after a long gap or context reset, run this sequence:

```
1. Read CLAUDE.md (3 min)
2. Read .plan/PROJECT_STATE.md (3 min)
3. git log --oneline -20 (see recent commits)
4. Read .plan/DECISION_LOG.md (scan last 5 entries)
5. Read the component spec for whatever you're about to build
```

Total: ~10 minutes. After this, proceed with full context.

**Do not ask the user to re-explain the product.** The files above contain everything needed.

---

## Governance References

Before beginning any implementation, be aware these governance documents exist and when to consult them:

| Document | When to read |
|---|---|
| `.plan/CONSTITUTION.md` | When uncertain whether a direction is right for the product |
| `.plan/architecture/ARCHITECTURE_INVARIANTS.md` | Before any architectural change; when invariants might be affected |
| `.plan/governance/DRIFT_PREVENTION.md` | When a pattern starts to feel "off"; before doing anything unusual |
| `.plan/governance/IMPLEMENTATION_REVIEW_CHECKLIST.md` | Before marking any task complete (mandatory) |
| `.plan/governance/SCOPE_DISCIPLINE.md` | When scope pressure arises; before expanding beyond current task |
| `.plan/governance/AI_SESSION_RULES.md` | When uncertain how to proceed in a session |
| `.plan/design-system/VISUAL_GUARDRAILS.md` | Before adding any new visual element or UI pattern |

---

## Design Drift Prevention

These patterns are how design systems decay. Flag them immediately:

### Color drift
- Any hex value not in `.plan/design-system/tokens/colors.md` → replace with token
- Any use of `#4ecdc4`, `#ffa552`, `#ff6b9d`, `#a78bfa`, `#ffc864` → these are banned
- Any `box-shadow` → remove entirely
- Any gradient background on a card or section → remove

### Typography drift
- Any font-size not in the six-size scale → correct to nearest scale value
- Any font-family not Syne or DM Mono → remove
- Any label without uppercase + letter-spacing → apply LABEL spec
- Any Syne below 18px → move to DM Mono at appropriate scale

### Motion drift
- Any animation without a stated purpose → remove
- Any `cubic-bezier` not from the library → replace with named easing
- Any `spring` or `bounce` parameter → remove
- Any decorative particle or atmospheric animation → remove

### Component drift
- EntryCard with colored macro values → PROHIBITED — replace with INK-2
- Progress bar with colored fill → replace with INK fill
- Any streak counter or achievement badge → remove
- Any "great job" or motivational copy → replace with operational copy or remove

### Architecture drift
- Anthropic API called from frontend → move to backend proxy
- Raw hex values in new components → replace with CSS custom properties
- `any` TypeScript type without comment → add specific type

---

## How to Handle a Conflict

**Scenario A: User request conflicts with a principle in `product/core-principles.md`**

1. Implement it anyway — No. Do not silently comply.
2. Refuse flatly — No. Be useful.
3. Correct approach: Name the conflict. Reference the principle. Offer an alternative that achieves the user's actual goal within the constraint.

Example:
> User: "Add a streak counter to the home screen."
> Response: "That conflicts with the anti-gamification principle in `product/core-principles.md` — Nouriq explicitly doesn't use streak mechanics. The underlying goal (showing consistency) is handled by the SIGNAL STATE system (e.g., 'Day 4 of this state') and the PATTERN qualifier ('consistent' / 'building' / 'irregular'). Would either of those cover what you're trying to communicate?"

**Scenario B: Two specs contradict each other**

Surface the conflict explicitly. Do not guess which is correct. Do not implement either until the conflict is resolved. Add the conflict to the Unresolved Decisions section in `PROJECT_STATE.md`.

**Scenario C: User explicitly overrides a rule ("just do it this way for now")**

Implement it. Record the override in `DECISION_LOG.md` with the context. Flag it as technical debt in `PROJECT_STATE.md`. Do not silently abandon the rule system — make the deviation visible.

---

## How to Write Updates Back

After every session that changes the product state:

```
If a P0–P9 item was completed:
  → Update PROJECT_STATE.md: move item from Pending to Completed

If a decision was made:
  → Append to DECISION_LOG.md

If a component spec changed during implementation:
  → Update the design-system/components/ file to match reality

If technical debt was added:
  → Add row to PROJECT_STATE.md#technical-debt

If a design token value changed:
  → Update the relevant design-system/tokens/ file
  → Update CSS custom properties in index.css
```

The write-back is not optional. It is how future sessions avoid re-making decisions already made.

---

## Session End Checklist

Before ending a session where code was written:

```
□ All new components use CSS custom property tokens (not raw hex values)
□ No banned colors introduced
□ No box-shadow introduced
□ No tab bar navigation introduced
□ No motivational/praise copy introduced
□ No Anthropic API calls added to frontend
□ PROJECT_STATE.md updated if applicable
□ DECISION_LOG.md updated if a decision was made
□ Component spec updated if implementation deviated from spec
```

---

*This protocol exists because good products decay through accumulated small violations. Every session that follows this protocol compounds the quality of the product. Every session that skips it compounds the decay.*
