# Onboarding

**Status:** Active — v1.1 spec
**Last updated:** 2026-05-07

→ **Full specification:** `ux/onboarding-system.md`

This file is a brief orientation. All implementation detail is in `onboarding-system.md`.

---

## Summary

Three setup screens. Then the product.

```
Screen 1: Welcome       "The system is beginning to learn."
Screen 2: Goal          BUILD / LOSE / MAINTAIN (tap to select, auto-advance)
Screen 3: Protein       Pre-filled target. "This is where we start."
          ↓
          Home screen — READING state, command bar focused
          "Start with what you had this morning."
```

From that point: the onboarding is the product running. No tutorial. No tour. No feature walkthrough.

---

## Activation Timeline

```
Day 0   First log → AI parsing proves accuracy → Trust Moment 1
Day 2   AI instruction references personal data → Trust Moment 2
Day 3   Training section appears (passive, no announcement)
Day 7   SIGNAL activates → STATE computed → DELTA live
        First-time inline explanation (one-time only)
        → Trust Moment 3: system names their pattern accurately
        ACTIVATION
Day 14  Weekly SIGNAL report available
```

---

## What Never Appears

Body weight question. TDEE calculator. Activity level. Feature tour. Notification prompt at setup. Progress step indicators. "Skip" button. Celebratory copy. Streaks from day 1.

→ Full prohibition list: `ux/onboarding-system.md#2-what-onboarding-never-does`

---

## Re-onboarding (Goal Change)

Settings sheet → "Change goal" → goal screen reappears → protein target resets to default for new goal → READING state for 3 days while new baseline forms.

No screens. No "are you sure?" modal. Immediate.
