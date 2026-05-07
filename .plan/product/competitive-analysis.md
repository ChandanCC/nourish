# Competitive Analysis

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `product/positioning.md` for how this informs positioning.

---

## Landscape Summary

The nutrition tracking space splits into three categories:
1. **Database-first apps** — MyFitnessPal, Lose It, Cronometer
2. **AI-adjusted apps** — MacroFactor, Carbon Diet Coach
3. **Wearable-integrated apps** — WHOOP, Oura, Apple Health

Nouriq sits in a different quadrant: **AI-synthesized intelligence + precision instrument aesthetic.**

---

## Primary Competitors

### MyFitnessPal

**Strength:**
- Largest food database (~14M foods)
- Brand recognition — the default answer to "how do you track food?"
- Barcode scanning
- Strong web companion

**Weakness:**
- Interface is 10+ years old; overwhelming number of metrics and tabs
- Premium features gated; free tier is ad-supported and degraded
- Gamification (streaks, badges, goal celebrations) that target users find infantilizing
- AI integration is surface-level (calorie estimates, not synthesis)
- No concept of pattern or state — every day is independent

**Nouriq's wedge:** The instrument aesthetic vs. consumer wellness app aesthetic. SIGNAL vs. passive calorie counting.

---

### MacroFactor

**Strength:**
- Genuinely scientifically rigorous approach to TDEE and calorie adjustment
- Clean, modern interface (dark mode, good typography)
- Adaptive calorie targets based on actual logged weight vs. expected
- Strong community of serious gymgoers

**Weakness:**
- Requires weight logging to activate the adaptive calorie adjustment — a second habit to form
- Primarily a calorie-adjustment tool, not an intelligence read
- No named state system — just calorie targets going up or down
- UX is functional but not distinctly designed (feels like a well-executed conventional app)

**Nouriq's wedge:** SIGNAL (pattern intelligence) vs. adaptive calorie adjustment. DM Mono / Syne aesthetic vs. conventional. Natural language logging vs. database search.

---

### Cronometer

**Strength:**
- Deepest micronutrient tracking in the space
- Trusted by dietitians and nutritionists
- Very precise — uses USDA/NCC databases

**Weakness:**
- Dense, clinical interface that overwhelms non-nutritionists
- No AI synthesis
- Positioning as a professional tool alienates casual users without serving serious users either

**Nouriq's wedge:** Not competing on micronutrient depth in v1.0. Competing on daily synthesis intelligence.

---

### WHOOP

**Strength:**
- Premium product with premium aesthetic
- Recovery score is genuinely trusted by serious athletes
- Hardware + software combination creates deep data
- Strong aspirational brand

**Weakness:**
- Nutrition is peripheral — a "journal" add-on, not a core feature
- Requires wearable hardware ($30/month subscription + device)
- Recovery-focused, not nutrition-focused

**Nouriq's wedge:** Nutrition intelligence as the primary product, not a wearable add-on. No hardware requirement.

---

## Design Reference Points (Not Competitors)

These products are referenced for design quality, not because they compete:

| Product | What Nouriq takes from it |
|---|---|
| Linear | Monochromatic design, typographic hierarchy, keyboard-first input |
| Raycast | Command-bar as primary action surface, instrument aesthetic |
| WHOOP app | Dark background, premium feel, minimal color |
| Oura app | Data visualization without chart overload |
| Bloomberg Terminal | Dense data without clutter, everything serves a function |

---

## Opportunity Assessment

The serious gymgoer (4–6x/week, specific goal, analytical) is underserved:
- Too serious for MyFitnessPal's consumer gamification
- Less interested in the science of TDEE adjustment (MacroFactor) than in "am I on track?"
- Does not want to also buy a wearable just for nutrition feedback

This segment is probably 2–5M people in the US. Even a 1% capture at a premium price point ($8–12/month) is a meaningful business.

The risk: this segment is also served (adequately, if not well) by existing tools. The switching cost is the food history that lives in another app. The answer: start as a complementary tool (log alongside what you already use), then convert as SIGNAL becomes the trusted read.
