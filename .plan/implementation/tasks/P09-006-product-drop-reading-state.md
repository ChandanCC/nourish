# P09-006 — Product Drop + READING State Display

**Phase:** 09 — Onboarding Flow
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P09-004, P09-005, P07-002
**Unlocks:** P09-007

---

## Purpose

After onboarding completes, navigate the user to the home screen where they see their first SIGNAL state: READING.

## Why It Exists

The "product drop" is the moment a new user first experiences the product. They land on the home screen with READING state, which is correct: day 1, baseline forming. No celebration, no tutorial pop-up yet (that's P09-007).

## Exact Scope

- After `PATCH /api/user/onboarding` succeeds: invalidate the `['home']` TanStack Query cache and navigate to home screen
- Home screen data will now include `onboardingComplete: true` on next fetch
- SIGNAL hero displays: `state: "READING"`, `subtitle: "Day 1 · Baseline forming"` (this comes from the backend if SignalState is set, or is the default READING placeholder)
- No celebratory animation, no success screen, no "you're all set!" message
- Transition: navigate to home screen, which triggers the standard app open sequence (P08-001)

## Files Expected to Change

```
frontend/src/pages/onboarding/ProteinTargetScreen.tsx  (navigate after save + invalidate query)
```

## Architecture Constraints

- `U-INV-03`: product drop is not a celebration — it's just the home screen with real state
- Use TanStack Query's `invalidateQueries(['home'])` after save to ensure fresh data

## Acceptance Criteria

1. After "Finish setup" button: home screen renders with READING state
2. SIGNAL hero shows "READING" and correct subtitle
3. No success screen, no celebration animation between onboarding and home
4. Build passes

## Estimated Complexity

M — ~1 hour. Navigation + cache invalidation.

## Claude Execution Guidance

After the PATCH succeeds: call `queryClient.invalidateQueries({ queryKey: ['home'] })` then `navigate('/')`. The home screen will re-fetch data and show READING state from the backend.
