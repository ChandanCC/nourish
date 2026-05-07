# Nouriq — AI Operating Document

**This file is read by Claude at the start of every session. It is authoritative. It supersedes any prior assumption about how this product should be built or designed.**

---

## What This Product Is

Nouriq is a **precision operating system for the body** — specifically, for gymgoers who want pattern intelligence from their nutrition and training, not a calorie counter with a social feed.

The reference frame is: Bloomberg Terminal. Aircraft glass cockpit. Linear. WHOOP recovery screen.

Not: MyFitnessPal. Not: a fitness motivation app. Not: a wellness brand.

---

## Context Loading Order

When starting any session in this repository, load in this order:

```
1. CLAUDE.md                               ← This file (always loaded first)
2. .plan/PROJECT_STATE.md                  ← Where we are right now
3. .plan/SESSION_PROTOCOL.md               ← How to operate in this session
4. .plan/product/core-principles.md        ← Product constitution (immutable)
5. .plan/design-system/visual-language.md  ← Design system overview
6. .plan/product/signal-system.md          ← The product's core concept
7. .plan/design-system/home-screen.md      ← Primary surface architecture
```

Then load only what the task requires:
- Building a component → read its spec in `.plan/design-system/components/`
- Making a product decision → read `.plan/product/positioning.md` + relevant ADRs in `.plan/decisions/`
- Engineering task → read `.plan/engineering/stack.md` + `.plan/engineering/constraints.md`
- Animation work → read `.plan/design-system/motion-system.md`
- Design token work → read all of `.plan/design-system/tokens/`
- Checking invariants / governance → read `.plan/architecture/ARCHITECTURE_INVARIANTS.md`
- Checking visual prohibitions → read `.plan/design-system/VISUAL_GUARDRAILS.md`
- Checking scope → read `.plan/governance/SCOPE_DISCIPLINE.md`

---

## Non-Negotiables

These rules are never overridden. If a request would violate them, flag the conflict and propose an alternative that doesn't.

### Design System
1. **Color:** BG family, INK family (opacity only), GOLD (3 places maximum), STATUS (data-only). No other chromatic color. No rainbow macros. The prohibited colors in `.plan/design-system/tokens/colors.md` are banned.
2. **Type:** Syne (STATE/headers only) + DM Mono (everything else). Two fonts. Six sizes. No exceptions.
3. **Spacing:** 4px base unit. 20px page gutter. Named tokens in `.plan/design-system/tokens/spacing.md`. No arbitrary values.
4. **Motion:** Every animation must pass the "one sentence purpose" test. Easing from `.plan/design-system/motion-system.md` only. No spring physics, no bounce, no decorative motion.
5. **Surfaces:** Four elevation levels. No box-shadow anywhere. No glassmorphism. No gradient backgrounds.

### Product Philosophy
6. **No gamification:** No streaks, badges, confetti, celebration screens, achievement notifications, or progress percentages on non-nutritional targets.
7. **No praise language:** The AI never says "Great job!", "You're crushing it!", or any variant. Copy is operational. "Add 30g protein to dinner" is allowed. "Keep going!" is not.
8. **Color = status, not identity:** Chromatic color appears only where it communicates a health/nutritional status relative to a target. Not for decoration.
9. **Absence is a design choice:** When data is absent, UI is absent. No skeleton screens, no empty state illustrations, no "get started" filler.
10. **No tab bar navigation:** The app is a single surface. The command bar is the only fixed bottom element.

### Engineering
11. **Anthropic API: backend proxy only.** `ANTHROPIC_API_KEY` never in frontend code. All AI calls via `POST /api/analyse`.
12. **JWT in backend only.** `JWT_SECRET` never in frontend code.
13. **TypeScript strict.** No `any` types without an explicit comment explaining why.
14. **Design tokens in code.** When implementing UI, use CSS custom properties from the design token system, not raw hex values.

---

## How to Handle Uncertainty

**Design uncertainty:** Default to restraint. Less color, less motion, less decoration. Ask: "what is the instrument panel equivalent of this element?"

**Product uncertainty:** Read `.plan/product/core-principles.md`. If still uncertain, check `.plan/decisions/` for a relevant ADR. If no ADR exists, surface the decision explicitly — don't guess and implement.

**Architecture uncertainty:** Read `.plan/engineering/constraints.md` and `.plan/engineering/stack.md`. Prefer existing patterns over new abstractions.

**When a user request conflicts with a principle:** Say so. Describe the conflict. Offer an alternative that achieves the goal within the constraint. Do not silently comply.

---

## Persistent State Rules

After completing work in a session, update these files if they are affected:

| Change type | File to update |
|---|---|
| Feature implemented | `.plan/PROJECT_STATE.md` → mark completed |
| Component spec changed by implementation | Update relevant `design-system/components/` file |
| Architecture decision made | Append to `.plan/DECISION_LOG.md` + create ADR in `decisions/` if significant |
| Design token added/changed | Update `design-system/tokens/` + CSS custom properties |
| Technical debt introduced | Add to `.plan/PROJECT_STATE.md#technical-debt` |
| Roadmap item completed | Update `.plan/product/roadmap.md` |
| Invariant violated (with justification) | Update `.plan/architecture/ARCHITECTURE_INVARIANTS.md` + DECISION_LOG.md |
| New governance concern identified | Add to `.plan/governance/DRIFT_PREVENTION.md` |

---

## Session Behavior

- **Do not re-explain** product philosophy or visual system back to the user. They designed it. Be a practitioner of it, not a narrator of it.
- **Do not add features** beyond what the task requires. No "while I'm here" additions.
- **Do not add comments** to code unless the WHY is non-obvious. Well-named identifiers are sufficient.
- **Do not create documentation** unless explicitly asked. Work from conversation context and existing `.plan/` files.
- **Do not introduce shortcuts** that violate design system rules for "just this once." Debt compounds.
- **Reference spec files** when implementing components. The source of truth is `.plan/`, not assumptions from training data.
- **Run the implementation review checklist** before marking any task complete. See `.plan/governance/IMPLEMENTATION_REVIEW_CHECKLIST.md`.
- **Check scope discipline** before expanding beyond the current task. See `.plan/governance/SCOPE_DISCIPLINE.md`.
- **Stop and ask** before making any requires-human-confirmation change. See `.plan/governance/AI_SESSION_RULES.md`.

---

## Product Identity in One Paragraph

Nouriq tells you what pattern your body is operating in — right now, based on your actual data. Not a score. Not a goal percentage. A named state (`OPTIMISING`, `BUILDING`, `CUTTING`, etc.) computed from the shape of your last 7 days, with a DELTA showing how far from your personal baseline you are, visualized as a waveform. The user types what they ate. The AI understands it. The system synthesizes it. The design gets out of the way.

---

## Governance System

This repository has an active governance system. Key documents:

| Document | Purpose |
|---|---|
| `.plan/CONSTITUTION.md` | Highest-level product and engineering philosophy |
| `.plan/architecture/ARCHITECTURE_INVARIANTS.md` | Immutable technical and product truths |
| `.plan/governance/DRIFT_PREVENTION.md` | Known drift patterns and recovery protocols |
| `.plan/governance/IMPLEMENTATION_REVIEW_CHECKLIST.md` | Mandatory pre-completion checklist |
| `.plan/governance/SCOPE_DISCIPLINE.md` | How tasks stay atomic |
| `.plan/governance/AI_SESSION_RULES.md` | Claude session discipline |
| `.plan/design-system/VISUAL_GUARDRAILS.md` | Prohibited visual patterns |

The governance system exists to protect coherence across time. It is not bureaucracy — it is the accumulated discipline that makes the product stable.

---

*Initialized: 2026-05-07 | Version: 1.1 (governance added)*
*Authoritative. Supersedes assumptions. Update requires explicit decision.*
