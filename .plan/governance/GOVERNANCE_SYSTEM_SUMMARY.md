# Governance System Summary

**Status:** Active
**Last updated:** 2026-05-07

Overview of all governance documents, how they interact, and what each one protects.

---

## The Governance System at a Glance

```
CONSTITUTION.md                          ← The "why" layer. What the product is.
architecture/ARCHITECTURE_INVARIANTS.md  ← The "what cannot change" layer.
governance/DRIFT_PREVENTION.md          ← The "what goes wrong" layer.
governance/IMPLEMENTATION_REVIEW_CHECKLIST.md  ← The "did I do it right" layer.
governance/SCOPE_DISCIPLINE.md          ← The "am I doing too much" layer.
governance/AI_SESSION_RULES.md          ← The "how should I behave" layer.
design-system/VISUAL_GUARDRAILS.md      ← The "what is prohibited visually" layer.
IMPLEMENTATION_RULES.md                 ← The "how do I implement" layer.
```

These documents are not redundant — they operate at different levels of abstraction and different moments in the implementation cycle.

---

## Document Roles

### `CONSTITUTION.md`
**When:** Before any major product or architectural decision. When uncertain whether a direction is right.
**What it protects:** The product's identity over time. What Nouriq refuses to become.
**Level:** Philosophy — the document that governs all other documents.

---

### `architecture/ARCHITECTURE_INVARIANTS.md`
**When:** Before making any architectural change. When an implementation path seems to conflict with how the system is designed.
**What it protects:** Technical and product properties that must hold for the system to remain coherent: data immutability, AI tier separation, sync/async boundary, color semantics, navigation model.
**Level:** Constitutional — requires ADR + DECISION_LOG entry to modify any invariant.

---

### `governance/DRIFT_PREVENTION.md`
**When:** When a pattern "doesn't feel right." When reviewing adjacent code and noticing decay. When an implementation session produces something that technically works but feels off.
**What it protects:** The accumulated coherence of the product. Prevents individual correct decisions from combining into architectural incoherence.
**Level:** Diagnostic — identifies known failure modes before they become entrenched.

---

### `governance/IMPLEMENTATION_REVIEW_CHECKLIST.md`
**When:** Before marking any task complete. Every time.
**What it protects:** The minimum viable correctness of any implementation: architectural checks, runtime checks, UX checks, intelligence checks, design-system checks, drift checks.
**Level:** Gate — the last checkpoint before a task ships.

---

### `governance/SCOPE_DISCIPLINE.md`
**When:** When scope pressure arises. When the impulse to do "while I'm here" improvements occurs. When a session is expanding beyond its defined task.
**What it protects:** Clean commit history, predictable implementation sessions, coherent feature delivery.
**Level:** Process — governs the rhythm of implementation work.

---

### `governance/AI_SESSION_RULES.md`
**When:** At the start of any Claude session. When uncertain how to proceed. When context is limited.
**What it protects:** Consistency across sessions separated by time. Prevents the gradual erosion of architectural discipline that happens when each session operates with partial context.
**Level:** Behavioral — governs the session itself, not just the output.

---

### `design-system/VISUAL_GUARDRAILS.md`
**When:** Before adding any new visual element, color, animation, or UI pattern. When reviewing a design and something feels "off" visually.
**What it protects:** The instrument-panel visual register. Prevents consumer fitness aesthetics from entering the design.
**Level:** Preventive — defines what cannot appear, not just what should.

---

### `IMPLEMENTATION_RULES.md`
**When:** During implementation. The practical companion to the architectural docs.
**What it protects:** Implementation habits: TypeScript discipline, component patterns, data operation correctness, documentation hygiene, definition of done.
**Level:** Operational — the day-to-day rules for how code is written.

---

## How They Interact

```
                    ┌──────────────────┐
                    │  CONSTITUTION    │  ← Governs the product's identity
                    └────────┬─────────┘
                             │
              ┌──────────────▼──────────────┐
              │  ARCHITECTURE_INVARIANTS    │  ← Technical truths
              └─────────────┬───────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
  ┌──────▼──────┐   ┌───────▼───────┐  ┌───────▼──────┐
  │   VISUAL    │   │    DRIFT      │  │ IMPL RULES   │
  │ GUARDRAILS  │   │  PREVENTION   │  │              │
  └──────┬──────┘   └───────┬───────┘  └───────┬──────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
              ┌─────────────▼────────────┐
              │  REVIEW CHECKLIST        │  ← Pre-completion gate
              └──────────────────────────┘
                            
  ┌─────────────────────────────────────────┐
  │  AI_SESSION_RULES + SCOPE_DISCIPLINE    │  ← Session behavior layer
  └─────────────────────────────────────────┘
  (applies throughout, not just at specific moments)
```

---

## What the Governance System Collectively Protects

| Risk | Protected by |
|---|---|
| Implementation chaos (doing too much) | SCOPE_DISCIPLINE |
| Visual drift (wrong colors, wrong patterns) | VISUAL_GUARDRAILS + ARCHITECTURE_INVARIANTS |
| Semantic erosion (terms diverging from spec) | DRIFT_PREVENTION + IMPLEMENTATION_RULES |
| AI-session drift (losing context between sessions) | AI_SESSION_RULES |
| Architectural degradation (shortcuts compounding) | ARCHITECTURE_INVARIANTS + DRIFT_PREVENTION |
| Token-fatigue shortcuts (raw hex, arbitrary values) | VISUAL_GUARDRAILS + IMPLEMENTATION_REVIEW_CHECKLIST |
| Intelligence drift (AI behavior softening) | ARCHITECTURE_INVARIANTS + DRIFT_PREVENTION |
| Product identity drift (becoming a different product) | CONSTITUTION + ARCHITECTURE_INVARIANTS |
| Gamification creep | ARCHITECTURE_INVARIANTS (U-INV-03) + VISUAL_GUARDRAILS |
| Scope bleed | SCOPE_DISCIPLINE + IMPLEMENTATION_REVIEW_CHECKLIST |

---

## Future Maintenance

**When to update CONSTITUTION.md:** Almost never. This is the founding document. If it needs updating, it is a significant product discussion.

**When to update ARCHITECTURE_INVARIANTS.md:** When an invariant genuinely no longer serves the product. Requires DECISION_LOG entry and ADR. Rare.

**When to update DRIFT_PREVENTION.md:** When a new drift pattern is identified in practice. Add the pattern, its warning signs, and its recovery protocol. This document should grow as experience accumulates.

**When to update IMPLEMENTATION_REVIEW_CHECKLIST.md:** When a new class of implementation error is discovered. Add a check for it. The checklist should only grow — items should rarely be removed.

**When to update SCOPE_DISCIPLINE.md:** When v1.1 ships and v1.2 scope boundaries need to be defined. The P-item boundaries table is version-specific.

**When to update AI_SESSION_RULES.md:** When the tooling, context window behavior, or session structure changes in a way that affects how sessions should be conducted.

---

*This governance system represents the accumulated discipline of building a precise product.*
*Its value compounds over time — the longer it is followed, the more it protects.*
