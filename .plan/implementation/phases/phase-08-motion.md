# Phase 08 — Motion System

**Status:** NOT_STARTED
**Tasks:** P08-001, P08-002, P08-003, P08-004, P08-005, P08-006
**Estimated duration:** 4–6 hours

---

## Purpose

Implement all motion from `design-system/motion-system.md`. Motion is additive — it enhances already-functional components. Nothing in this phase changes data flow or component props.

This is the highest-risk phase for scope creep and invariant violations. Every animation must pass the "one sentence purpose" test before implementation.

---

## Prerequisites

- Phase 07 complete (all components wired to real data)
- Phase 02 complete (static components exist in their final visual form)

---

## Exit Conditions (Phase Complete When)

1. App open sequence: SIGNAL zone fades in with correct timing
2. Entry card arrival: new entries animate in from below with stagger
3. Number counting: macro totals count up when data loads
4. Progress bar fill: bars fill on mount with correct easing
5. Waveform rise: bars rise from 0 on initial load
6. Card expand/collapse: entry detail expansion animates correctly
7. No spring physics, no bounce, no decorative motion
8. All easing values from `design-system/motion-system.md` — no custom cubic-bezier values

---

## Tasks

| Task | What it does |
|---|---|
| P08-001 | App open sequence: SIGNAL zone fade-in |
| P08-002 | Entry card arrival animation (new entries, stagger) |
| P08-003 | Number counting animation for macro totals |
| P08-004 | Progress bar fill animation on mount |
| P08-005 | Waveform bar rise animation on initial load |
| P08-006 | Card expand/collapse animation |

**Dependency order:** All tasks are independent. Run after Phase 07 is complete.

---

## Architecture Constraints

- `design-system/motion-system.md` — all easing, duration, and trigger specs
- `architecture/ARCHITECTURE_INVARIANTS.md#U-INV-04` — motion must not delay interaction readiness
- `architecture/ARCHITECTURE_INVARIANTS.md#E-INV-05` — no box-shadow (applies to pseudo-depth effects too)
- `governance/VISUAL_GUARDRAILS.md` — prohibited animation patterns

---

## Motion Inventory

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| SIGNAL zone fade-in | 400ms | ease-out | App mount |
| Entry card arrival | 200ms per card, 40ms stagger | ease-out | New item in list |
| Number counting | 600ms | ease-out | Data load |
| Progress bar fill | 500ms | ease-out | Mount |
| Waveform bar rise | 300ms per bar, 30ms stagger | ease-out | Mount |
| Card expand | 200ms | ease-in-out | User tap |
| Card collapse | 160ms | ease-in | User tap |

All values above are from motion-system.md. If they differ, motion-system.md wins.

---

## Implementation Approach

Use CSS transitions/animations for simple cases. Use JS-driven animation (requestAnimationFrame or a lightweight lib) only for number counting and staggered entry arrival. Do not introduce Framer Motion or GSAP — they are not in the stack.

```css
/* Correct: uses tokens from motion-system.md */
.entry-card {
  transition: opacity var(--motion-duration-fast) var(--motion-ease-out);
}

/* Wrong: arbitrary values */
.entry-card {
  transition: opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

## One-Sentence Purpose Test

Before implementing any animation, answer: "This animation exists to ___."

Valid answers:
- "...show that a new entry was added to the list." (entry arrival)
- "...show that numbers are loading and settling." (number counting)

Invalid answers:
- "...make the app feel more premium."
- "...add polish to the transition."
- "...make it feel alive."

If you cannot answer with a functional purpose, do not implement it.

---

## What Exists After This Phase

- All designed animations from motion-system.md implemented
- Motion enhances but never blocks interaction
- No animation violates the motion invariants
- App has the designed kinetic feel without decorative excess
