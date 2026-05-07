# Product Roadmap

**Status:** Active — v1.0
**Last updated:** 2026-05-07

This is a directional roadmap, not a commitment schedule. Dates are rough targets; features move based on learning.

---

## Now — v1.0 (Current)

**Goal:** Core logging loop works. SIGNAL is computed and displayed. Product is usable for the target user's daily loop.

**Included:**
- Natural language food logging via AI parsing (Anthropic API proxy)
- Macro tracking (calories, protein, carbs, fat, fiber)
- Google OAuth + JWT auth (user-scoped data)
- 7-day history with compact history rows
- Basic home screen (functional, not yet fully redesigned to spec)
- Backend on AWS Lambda + API Gateway
- Frontend on S3 + CloudFront

**Completed beyond initial v1.0 scope (now done):**
- EntryCard redesign ✅ (spec in `design-system/components/entry-card.md`)
- Design token system (23 CSS custom properties) ✅
- Color palette (BG/INK/GOLD/STATUS) applied to codebase ✅
- Backend architecture fully specified ✅

**Still pending for v1.1:**
- SIGNAL hero component (spec in `design-system/components/signal-hero.md`)
- Home screen full redesign (spec in `design-system/home-screen.md`)
- Waveform visualization
- STATE computation (AI-driven)
- DELTA calculation
- Number counting animations
- App open sequence

---

## Next — v1.1

**Goal:** The designed product ships. All spec documents in `.plan/` are implemented.

**Features:**
- Home screen redesign per `design-system/home-screen.md`
- SIGNAL hero with waveform per `design-system/components/signal-hero.md`
- ~~EntryCard redesign per `design-system/components/entry-card.md`~~ ✅ Done
- Command bar focused state with gold border
- ~~Design tokens in Tailwind: BG/INK/GOLD/STATUS CSS variables~~ ✅ Done
- STATE computation (AI-driven via Claude, server-side)
- DELTA calculation (7-day rolling vs. personal baseline)
- Motion system: app open, entry arrival, number counting
- Collapsed SIGNAL strip on scroll
- Waveform day navigation

**Success metric:** A user opening v1.1 looks at the home screen and feels it without reading anything.

---

## Later — v1.2

**Goal:** Training component ships. SIGNAL becomes multi-signal (not just nutrition).

**Features:**
- Manual workout logging (sets × reps × weight) — full implementation
- Training feeds SIGNAL computation
- `Progressive on N lifts` detection
- Weekly SIGNAL report (auto-generated, in-app)
- Micronutrient detail panel (expandable)
- Onboarding flow (goal declaration, baseline period)

---

## Future — v2.0

**Goal:** Reduce logging friction. Add platform surface area.

**Features:**
- Shareable weekly report card (`future/weekly-report-share.md`)
- Barcode scanner (food database lookup)
- Meal templates (re-log a frequent meal in one tap)
- Capacitor wrapper (HealthKit access for HRV/sleep/workouts)
- Apple Watch complication (SIGNAL state + delta)

---

## Explicitly Not Roadmapped

These are out of scope indefinitely:
- Social features (leaderboards, friend tracking, sharing meals)
- Recipe database / meal planning
- Coach/trainer portal
- Web version (desktop browser optimization)
- Calorie remaining as a hero number
- Streak tracking
