# Visual Guardrails

**Status:** Active
**Last updated:** 2026-05-07

The design system is not a palette of options — it is a set of constraints. These guardrails define what Nouriq's visual language explicitly prohibits and what it protects.

Read alongside `design-system/visual-language.md` (principles) and `design-system/tokens/colors.md` (values).

---

## Prohibited UI Patterns

### Rainbow Macro Coding

**Prohibited:** Color-coding macros by type. Protein = teal/green. Carbs = orange. Fat = purple. This pattern is ubiquitous in consumer fitness apps. It is explicitly not in Nouriq.

**Why:** Color-as-identity makes macros feel like competing categories rather than components of a single picture. It also introduces four new chromatic colors that have no semantic role — they exist purely for differentiation. INK at varying opacity handles hierarchy without color.

**What to use instead:** The macro label (PROTEIN, CARBS, FAT) and INK fill on progress bars. The label is the identifier. The bar length is the quantity. Color adds nothing.

---

### Celebration States

**Prohibited:** Oversized goal-completion animations, confetti, trophy icons, "streak achieved" banners, pulsing completion rings, fireworks, rising stars.

**Why:** Celebration signals that the product is rewarding behavior rather than reporting it. A user who has hit their protein target has done something for themselves, not for the product. The product acknowledges this by being silent — the bar is full, the number is correct. That is the reward signal.

**What to use instead:** Goal completion = full progress bar. The animation is a single pulse (one beat, EASE-OUT, 240ms). See `design-system/motion-system.md`.

---

### Glassmorphism

**Prohibited:** Frosted glass backgrounds, backdrop-filter blur on UI elements, translucent cards floating over gradients, layered semi-transparent surfaces.

**Why:** Glassmorphism is an aesthetic choice that communicates "app" rather than "instrument." It creates depth without structure. It is visually rich without being informationally rich. The Nouriq surface system uses solid backgrounds at defined elevation levels. See `design-system/tokens/surfaces.md`.

**What to use instead:** `surface-card` (BG-1 background, 1px INK-4 border) and `surface-sheet` (BG-2). No blurs. No translucency on structural elements.

---

### Gradient Backgrounds on Cards or Sections

**Prohibited:** Background gradients on any card, section, or structural element. This includes "subtle" gradients.

**Why:** Gradients add visual energy. Visual energy competes with data density. The instrument panel is flat. Gradients imply motion or hierarchy where there is none.

**What to use instead:** Solid BG-family backgrounds. Contrast between sections is handled by the BG elevation steps (BG-0 → BG-1 → BG-2 → BG-3).

---

### Box Shadows

**Prohibited:** `box-shadow` on any element. No drop shadows, no inner shadows, no text shadows on data elements.

**Why:** Box shadows imply spatial depth. Nouriq is flat. Depth in the design system is handled by the background elevation steps and border opacity, not by shadows. A card on BG-1 over BG-0 communicates containment through background difference, not drop shadow.

**What to use instead:** Elevation = background color step. `surface-card` on BG-0 page = BG-1 background with INK-4 border.

---

### Neon / Gaming Aesthetics

**Prohibited:** Bright color on dark backgrounds in a gaming/cyberpunk aesthetic. Glowing elements, bright highlight rings, electric blue or green accent colors, neon status indicators.

**Why:** The dark background of Nouriq is not a gaming background — it is an instrument background. The warm INK-0 on BG-0 creates a precision-instrument feel. Introducing neon colors shifts the reference from "Bloomberg Terminal" to "fitness gaming app."

**What to use instead:** GOLD (`#EDB84A`) is the only warm accent. STATUS colors (`#3ECFA2`, `#E8A640`, `#E85454`) are the only chromatic colors, and they are restrained to data indicators only.

---

### Social Media Feed Patterns

**Prohibited:** Infinite scroll of user-generated content, "like" indicators on food logs, follower counts, social proof elements, activity feeds from other users, community boards.

**Why:** The product is a personal intelligence instrument. Not a community. Not a sharing platform. Food logs are private analytical records, not posts.

---

### Dashboard Overload

**Prohibited:** Screens with more than three primary data points visible simultaneously. Charts that show more than 7 data points. Tables. Multi-column layouts. Small multiples grids. Sparklines next to other sparklines.

**Why:** Data density without hierarchy is noise. The home screen hierarchy is deliberate: one STATE (the answer), one set of macro rows (the detail), one waveform (the shape). Adding more data does not make the product more useful — it makes it harder to read.

---

### Dopamine-Heavy Interactions

**Prohibited:** Haptic-feedback-on-every-tap, color flash on button press, bounce animations on elements, satisfying "pop" sounds, large visual state changes on hover.

**Why:** Dopamine-engineering makes the product engaging in the short term and meaningless in the long term. The product's engagement loop is: log → see accurate data → recognize your pattern → adjust behavior. Not: tap → feel good → tap again.

---

## Prohibited Color Usage

| Color | Prohibition |
|---|---|
| `#4ecdc4` (teal) | Banned — was macro color for protein |
| `#ffa552` (orange-warm) | Banned — was macro color for carbs |
| `#ff6b9d` (pink) | Banned — was macro color |
| `#a78bfa` (purple) | Banned — was macro color for fat |
| `#ffc864` (old gold) | Banned — replaced by `--gold: #EDB84A` |
| Any blue, navy, royal blue | Not in the design system |
| Any green outside STATUS-UP | STATUS-UP only, and only for data status |
| Any red outside STATUS-DOWN | STATUS-DOWN only, and only for data status |
| Any gradient as a background | All backgrounds are solid BG-family |

Full color system: `design-system/tokens/colors.md`

---

## Prohibited Animation Styles

| Pattern | Prohibition |
|---|---|
| Spring physics / bounce | Not in the motion system |
| Particle systems | Not in the design language |
| Continuous/looping animations | Nothing loops at rest |
| Entry animations > 400ms | Breaches the 700ms total open budget |
| Staggered reveals with > 50ms gap | Exceeds spec (25ms max gap for waveform) |
| Scale animations > 1.02 on hover | Card hover uses opacity + border, not scale |
| Color pulse on important data | One-time goal completion pulse only |

Full motion system: `design-system/motion-system.md`

---

## Prohibited Typography

| Pattern | Prohibition |
|---|---|
| Any font not Syne or DM Mono | Two fonts only |
| Syne below 18px | Syne is display-only (18px+) |
| Syne at weight 400 or 500 | Syne is 700 or 800 only |
| DM Mono italic | Not in the type system |
| Mixed-case STATE text | STATE is always ALL CAPS |
| Sentence case for labels | Labels are UPPERCASE + letter-spacing |
| Font sizes outside the 6-size scale | Scale is fixed: see `design-system/tokens/typography.md` |
| Line-height deviating from scale | Use scale values, not arbitrary line heights |

---

## "Feels Like Nouriq" Validation

When a design is complete, run it against these questions:

**Could this exist on a Bloomberg Terminal?**
If the honest answer is "no, it's too consumer/lifestyle," reconsider. The Bloomberg Terminal is the visual register: data-forward, structured, text-dense, no decoration.

**Is every colored element communicating a status relative to a target?**
If any colored element is present for visual interest, section identity, or aesthetic variety — remove it or convert it to INK at appropriate opacity.

**Is every animation informing the user of something?**
If an animation exists for pleasure, remove it. If removing it makes the interaction feel broken, it may be doing useful work. Test the distinction honestly.

**Is the screen calm at rest?**
After the 700ms open sequence completes, nothing should move. No pulsing, no shimmer, no animated background. The screen is an instrument, not a performance.

**Would a user with 3 seconds be able to understand their current state?**
STATE → DELTA → macro rows. If those three pieces of information can't be absorbed in 3 seconds, the hierarchy has failed.

**Does anything on the screen feel like a reward?**
If yes, what is being rewarded and why? If the answer is "the user used the app," remove it.

---

## Emotional Tone Validation

Nouriq communicates in one register: **precise and operational**.

| Emotion | Nouriq produces it by... |
|---|---|
| Confidence | Accurate data, named states, specific numbers |
| Calm | No competing elements, settled UI, no pulsing |
| Agency | Instruction is one specific action, not general advice |
| Recognition | STATE matches subjective experience |
| Trust | System is silent when uncertain |

| Emotion | Nouriq explicitly avoids... |
|---|---|
| Excitement | No celebration states, no neon, no confetti |
| Guilt | No "you missed a day", no negative streaks |
| Anxiety | No urgent-red warnings for mild states |
| Validation-seeking | No praise language, no star ratings |
| FOMO | No "your friends are logging" |

---

## Visual Restraint Principles

**When in doubt, do less.** A simpler version is almost always better. Add elements when they are missing, not when they might be nice.

**One new element at a time.** Don't introduce a new color and a new animation in the same component. Evaluate each addition independently.

**The spec is the reference, not other apps.** When evaluating a design decision, the question is "does this match the spec?" — not "does this match what [other fitness app] does?"

**Default to INK.** Most visual hierarchy needs in Nouriq can be solved by INK at the right opacity level. Before reaching for a new color, try INK-1, INK-2, INK-3 in sequence.

---

*This file is a complement to `design-system/visual-language.md`, not a replacement.*
*Visual-language covers the design philosophy. This file covers what is prohibited.*
