# P09-001 — Onboarding State Detection

**Phase:** 09 — Onboarding Flow
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-001
**Unlocks:** P09-002

---

## Purpose

Detect whether a logged-in user needs onboarding and route them to the onboarding flow if so.

## Why It Exists

After P04-001, new users have a User document with `onboarding_complete: false`. This task reads that flag and redirects accordingly before the home screen renders.

## Exact Scope

- Update `GET /api/home` to include `onboardingComplete: boolean` in the response (or add a separate `GET /api/user/me` endpoint)
- On the frontend: after auth, check `onboardingComplete`
- If `false`: redirect to `/onboarding` route
- If `true`: render home screen normally
- Create a route `/onboarding` in the frontend router

## Files Expected to Change

```
backend/src/routes/home.ts              (add onboardingComplete to response)
frontend/src/pages/App.tsx or router    (add /onboarding route)
frontend/src/hooks/useHomeScreen.ts     (read onboardingComplete field)
```

## Architecture Constraints

- `onboardingComplete` field comes from the backend User document — never a frontend-only localStorage flag
- Redirect happens after auth, before home screen renders
- A logged-out user is redirected to `/login` (existing auth flow) — not to onboarding

## Acceptance Criteria

1. User with `onboarding_complete: false` → redirected to `/onboarding`
2. User with `onboarding_complete: true` → rendered home screen normally
3. Redirect happens before home screen content is visible
4. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

The simplest approach: include `onboardingComplete` in the HomeScreenPayload response. In the frontend, check this field after data loads. If false, use `useNavigate('/onboarding')`. Create a minimal `/onboarding` route that renders a placeholder initially (the screens are built in P09-002/003/004).
