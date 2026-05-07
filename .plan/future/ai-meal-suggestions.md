# Future Idea: AI Meal Suggestions

**Status:** Deferred — not in v1.0
**Last updated:** 2026-05-07

---

## Concept

Based on the user's STATE, DELTA, and remaining macro targets for the day, the AI proactively suggests 2–3 specific meal options that would move them toward their goal.

Example when `UNDERFUELLED` + `−22% below baseline`:
```
SIGNAL SEES A GAP

You need ~420 kcal and 38g protein before tonight.
That's roughly one of:
  · Chicken thigh + rice bowl  (450 kcal, 41g protein)
  · Greek yoghurt + granola + eggs  (390 kcal, 35g protein)
  · Protein shake + banana + peanut butter  (480 kcal, 32g protein)

→ Log what you chose
```

---

## Why Deferred

- Requires personalization of meal options based on dietary preferences / restrictions — needs an onboarding data point we don't collect yet
- Risk of over-indexing on the AI as a meal planner (the product is a tracking tool, not a meal planning tool)
- Distraction from the core loop in v1.0: the core loop must be proven before suggestions are layered on

---

## Design Constraints (if built)

- Maximum 3 suggestions. Never a long list.
- Suggestions appear only when STATE is `UNDERFUELLED` or `PROTEIN-LIMITED` — not proactively on normal days
- Must be dismissable without logging
- Never framed as "you should eat X" — always framed as "here's what fills the gap"
- The font, format, and surface must be consistent with the existing text-based command interface — no food photography, no colorful cards
