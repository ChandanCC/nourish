# Core Principles

**Status:** Immutable. Changes require a founding-level decision and a new ADR.
**Last updated:** 2026-05-07

These are not aspirations. They are constraints. Every design, product, and engineering decision is evaluated against them.

---

## The Positioning Statement

> Nouriq is a precision operating system for the body.

Not a food diary. Not a calorie counter. Not a fitness motivator. An OS — systematic, always running, always reading, always accurate.

---

## Immutable Principles

### 1. The system reads. The user decides.

Nouriq presents data, not instructions. The AI line at the bottom of the screen is operational guidance, not motivational coaching. "Add protein before dinner" is allowed. "You're crushing it! Keep going!" is not.

**Why:** The target user is an analytical gym professional. They are insulted by praise they didn't earn and distracted by emotion they didn't ask for. Trust is built through accuracy, not enthusiasm.

### 2. Emptiness is information.

When data is absent, the UI is absent. No placeholder cards. No ghost states. No "ready to start?" empty illustrations. The precision of the absence communicates that every visible element is real.

**Why:** Consumer apps fill empty space to reduce anxiety in passive users. Nouriq's users are active and intentional. Empty space that represents genuine absence is more honest and more premium.

### 3. Motion carries information or is absent.

Every animation communicates something. If its purpose cannot be stated in one sentence, it is removed. No decorative animations. No spring physics. No bounce.

**Why:** Decorative motion signals "we are trying to impress you." A precision tool does not try to impress — it performs.

### 4. Color communicates status, not identity.

Chromatic color (beyond the monochromatic INK system and brand gold) appears only where it communicates a health/nutritional status relative to a target. Not for decoration, not for branding individual macros, not for making the UI "pop."

**Why:** Chromatic noise is the enemy of analytical clarity. WHOOP uses one accent color. Bloomberg Terminal uses two. The constraint is the design.

### 5. Hierarchy before decoration.

If two elements compete visually, the problem is hierarchy, not decoration. The solution is to reduce one element's prominence — not to add visual complexity to both.

**Why:** Every premium analytical product (Linear, WHOOP, Raycast, Stripe) achieves its feel through restraint. Adding decoration to solve a hierarchy problem compounds the problem.

### 6. One thing is primary. Everything else serves it.

On every screen, one element is the primary information. Everything else is context, detail, or action. If two elements claim primacy, one is removed or demoted.

**Why:** The SIGNAL STATE is primary on the home screen. The calorie bar is not. The food description is primary in an entry card. The macro rainbow is not. Single hierarchy creates calm.

### 7. Precision over personality.

The product has a voice (analytical, precise, non-emotional). It does not have a personality (witty, friendly, enthusiastic). The copy is instrumental. The design is systematic.

**Why:** Personality creates inconsistency over time. Precision is scalable. As the product grows to thousands of users and dozens of screens, "be precise" is a reliable constraint. "Be witty" is not.

### 8. The user's data is the product.

The app's visual design exists to make the user's own data legible, not to make the app itself attractive. Every screen asks: "does this help the user understand their data better?" Not: "does this look impressive?"

**Why:** The fundamental difference between a data tool and a consumer app. Nouriq is the former.

---

## Emotional Positioning

**How the app should make users feel:**
Calm clarity about a complex system.

**Not:**
- Proud (gamification)
- Excited (consumer app)
- Anxious (notification-heavy)
- Motivated (coaching app)
- Impressed (design showcase)

**The closest analogy:**
The feeling of checking a Bloomberg terminal when you know what you're looking at. Nothing is trying to get your attention. Everything relevant is exactly where you expect it. You extract the information you need and proceed.

---

## Anti-Principles

Things Nouriq explicitly does not do:

- Streaks with visual flame/fire indicators
- Achievement badges or milestone notifications
- Confetti or celebration animations
- Social comparison features on any primary surface
- Colorful macro-specific color coding (rainbow systems)
- Motivational copy ("You're doing great!")
- Onboarding tutorials with characters or mascots
- Generic startup gradients
- Glassmorphism
- Bottom navigation tab bars (implies a dashboard, not a system)
- Push notifications for daily streaks
- Gamification of any health metric

---

## Product Bets

These are directional bets that define what Nouriq is willing to sacrifice:

**Bet:** Premium positioning over mass adoption.
**Sacrifice:** Accessibility features that would make the app feel more consumer-friendly.

**Bet:** AI accuracy over AI speed.
**Sacrifice:** Instant (fake-fast) analysis in favor of accurate analysis that takes longer.

**Bet:** Pattern intelligence over daily tracking.
**Sacrifice:** The "did I hit today's goal?" simple feedback loop. Nouriq cares about the week, not the day.

**Bet:** Calm experience over engagement metrics.
**Sacrifice:** Push notifications, streak mechanics, and daily active user optimization.
