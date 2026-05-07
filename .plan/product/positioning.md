# Product Positioning

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `core-principles.md#product-bets` for the bets this positioning makes.
→ See: `decisions/003-signal-not-score.md` for why SIGNAL is a state, not a score.

---

## The One-Line Positioning

> **Nouriq is the nutrition tracker for people who don't want a nutrition tracker.**

---

## What This Means

The target user is frustrated with existing tools. They've tried MyFitnessPal. They find it tedious, clinical, and anxiety-inducing. They stopped logging because the act of logging felt like work without return.

Nouriq's bet: the problem is not that logging is inherently bad. The problem is that existing tools return data without intelligence. Users get numbers — macros, calories, percentages — but no synthesis. No answer to "am I doing the right thing?"

Nouriq's value exchange: **log naturally, receive intelligence.** The user types "had a bowl of oats and a coffee" and the system does the rest — parses the food, computes macros, updates their SIGNAL, and tells them what it means for their goal.

---

## Target User

**Primary:** Gymgoers (male, 22–35) who:
- Train 4–6x per week seriously
- Have a specific goal: bulk, cut, or maintain
- Have tried calorie tracking before and stopped
- Are analytical / data-oriented in their work and life
- Use tools like Linear, Notion, Bear, or Raycast — expect quality software
- Would not describe themselves as "fitness app users"

**Secondary:** Anyone who has a protein target and finds traditional macro trackers overwhelming.

**Explicitly not:** Casual health interest ("trying to eat better"), medical dietary management, weight loss as the primary driver.

---

## Competitive Positioning

| Tool | Their positioning | Where they fall short for Nouriq's user |
|---|---|---|
| MyFitnessPal | Database-first logging | Interface is overwhelming, gamification feels cheap, intelligence is minimal |
| Cronometer | Micronutrient precision | Clinical and dense; no daily synthesis; no AI |
| Lose It! | Weight loss motivation | Consumer aesthetic, streak-driven, not data-serious |
| MacroFactor | AI calorie adjustment | Closest competitor; stronger on TDEE science; weaker on UX and the instrument aesthetic |
| Carbon Diet Coach | Coaching-first | Requires paid plans, coaching-forward positioning |
| WHOOP | Recovery tracking | Training/sleep focus; nutrition is peripheral |
| Apple Health | Passive data aggregation | Not an active logging tool; no AI synthesis |

**Nouriq's wedge:** The visual language, the AI-computed STATE system, and the instrument aesthetic are different enough from all of these that users who value that difference will prefer Nouriq despite smaller feature surface area.

---

## Positioning Bets

These are explicit bets — they could be wrong:

1. **Precision over mass adoption.** A smaller number of users who love the product is better than a larger number who use it occasionally. The product is designed to be the best possible tool for a specific person.

2. **Pattern over daily tracking.** Users who fail at tracking are not failing because they lack discipline — they fail because daily tracking without context is unsatisfying. SIGNAL makes every log session meaningful by contextualizing it within a pattern.

3. **Calm over engagement.** No streaks, no badges, no daily active user push notifications. The app should feel like checking an instrument, not a social platform.

4. **Accuracy over speed.** The AI parsing step adds latency vs. barcode-scan logging. The bet: users would rather type naturally and have it be correct than scan barcodes through a database with spotty accuracy.

---

## What Nouriq Explicitly Does Not Compete On

- Database size (MyFitnessPal has millions of foods; Nouriq uses AI to parse natural language)
- Recipe import / meal planning (out of scope in v1.0)
- Social features or community
- Lowest price (premium positioning)
- Comprehensive micronutrient tracking (Cronometer owns this; Nouriq shows micros as a signal, not the feature)
