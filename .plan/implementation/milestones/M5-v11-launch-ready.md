# M5 — v1.1 Launch Ready

**Phases:** 09, 10
**Tasks:** P09-001 through P09-007, P10-001 through P10-004
**Status:** NOT_STARTED

---

## Definition

New user onboarding works end-to-end. The system is production-hardened: validated, logged, secured, and error-bounded. v1.1 is ready to ship.

## Milestone Complete When

1. New users are routed to onboarding after login
2. Goal and protein target saved to User document
3. Product drop: new users see READING state on first home screen
4. One-time SIGNAL explanation shown and dismissible
5. Returning users bypass onboarding entirely
6. All routes emit structured JSON logs
7. Frontend error boundaries prevent full crashes
8. All write routes validated with Zod
9. Security headers present on all responses
10. `npm run build` passes for both frontend and backend

## Validation

- Create a new Google account and log in
- Confirm: onboarding flow shows (goal screen → protein screen)
- Complete onboarding
- Confirm: home screen shows with READING state
- Confirm: SIGNAL explanation overlay appears
- Dismiss it
- Reload: confirm overlay does not appear again
- Log out, log back in with the same account
- Confirm: onboarding does not show again

## Time Estimate

9–13 hours from Phase 09 start.

---

**At M5: v1.1 is complete and production-ready.**
