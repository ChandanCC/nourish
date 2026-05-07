# Phase 09 — Onboarding Flow

**Status:** NOT_STARTED
**Tasks:** P09-001, P09-002, P09-003, P09-004, P09-005, P09-006, P09-007
**Estimated duration:** 6–8 hours

---

## Purpose

Implement the new user onboarding flow: goal selection, protein target, and the "product drop" — the moment a new user lands on the home screen and sees SIGNAL for the first time. After this phase, new users have a complete first-run experience.

---

## Prerequisites

- Phase 04 complete (User model with goal + protein_target exists)
- Phase 07 complete (home screen is live with real data)
- Phase 06 complete (SIGNAL state computation works)

---

## Exit Conditions (Phase Complete When)

1. New users (no User document) are routed to onboarding after login
2. Goal selection screen renders with correct options (muscle_gain, fat_loss, maintenance, performance)
3. Protein target screen renders with a numeric input and correct default
4. Onboarding data is saved to the User document before home screen is shown
5. After onboarding, user lands on home screen with READING state
6. First-time SIGNAL explanation is shown once (dismissible, never shown again)
7. Returning users bypass onboarding entirely

---

## Tasks

| Task | What it does |
|---|---|
| P09-001 | Detects onboarding state on app load; routes new users to onboarding flow |
| P09-002 | Welcome screen (first onboarding step) |
| P09-003 | Goal selection screen |
| P09-004 | Protein target screen |
| P09-005 | Backend: PATCH /api/user/onboarding saves goal + protein_target |
| P09-006 | Product drop: home screen entry for new users (READING state display) |
| P09-007 | First-time SIGNAL explanation overlay (one-time, dismissible) |

**Dependency order:** P09-001 → P09-002 → P09-003 → P09-004 → P09-005 (parallel with P09-004) → P09-006 → P09-007.

---

## Architecture Constraints

- `architecture/ARCHITECTURE_INVARIANTS.md#U-INV-03` — onboarding must not feel like a product tour
- `architecture/ARCHITECTURE_INVARIANTS.md#P-INV-02` — no gamification (no "let's get started!" energy)
- `product/core-principles.md` — tone is operational, not motivational
- `product/signal-states.md#READING` — READING state copy for new users

---

## Onboarding Detection (P09-001)

After login, GET /api/home returns `userId`. The backend check:

```typescript
const user = await User.findById(userId);
if (!user || !user.onboarding_complete) {
  // route to onboarding
}
```

On the frontend, `useHomeScreen` returns `null` if onboarding is not complete. The router redirects to `/onboarding`.

---

## Goal Options

```typescript
type Goal = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'performance';
```

Display labels:
- `muscle_gain` → "Build muscle"
- `fat_loss` → "Reduce body fat"  
- `maintenance` → "Maintain weight"
- `performance` → "Athletic performance"

No description text below options. No icons. No color coding per option.

---

## Protein Target Screen

Default value: 160g (overridable). Input is a plain number input. No slider. No gamified "recommended range" display.

The screen shows: `[number]g protein / day` and a continue button. That's it.

---

## Product Drop (P09-006)

After onboarding data is saved:
1. Navigate to home screen
2. Home screen shows READING state
3. SIGNAL hero is visible with: state = "READING", subtitle = "Day 1 · Baseline forming"
4. No celebration animation, no confetti, no welcome banner

---

## First-Time SIGNAL Explanation (P09-007)

A single-use overlay that explains what SIGNAL is. Triggered once after first home screen load. Stored as `localStorage` flag: `nouriq_signal_explained = true`.

Content (matches `product/signal-states.md` READING description):
- "SIGNAL tracks your pattern" — one line
- "Log meals for 7 days. Your baseline forms automatically." — one line
- "Got it" button — dismisses, sets flag, never shown again

No carousel. No multi-step tour. No illustrations.

---

## What Exists After This Phase

- Complete new user first-run experience
- Goal and protein target stored on User document
- READING state displayed on first home screen visit
- One-time SIGNAL explanation shown and dismissible
- Returning users unaffected
