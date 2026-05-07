# P06-003 — POST /api/signal Route

**Phase:** 06 — AI Synthesis
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P06-002, P05-005
**Unlocks:** P07-006, P09-007

---

## Purpose

Create the `POST /api/signal` route that triggers a full Tier 1→2→3 SIGNAL recomputation for the authenticated user and returns the updated SignalState.

## Why It Exists

The frontend needs an explicit way to request a fresh SIGNAL computation (e.g., after onboarding). The route provides a synchronous trigger for the full pipeline including Tier 3.

## Required Reading

- `engineering/backend-architecture.md#routes` — route conventions

## Exact Scope

- Create `POST /api/signal` route:
  1. Call `computeSIGNAL(userId)` (which includes Tier 3 via the wrapper)
  2. Return the updated `SignalState` document as JSON
  3. Return 200 with the state

```typescript
// Request: no body required
// Response:
{
  state: string;
  subtitle: string | null;
  delta: string | null;
  patternQualifier: string | null;
  aiInstruction: string | null;
  isStale: boolean;
}
```

## Out of Scope

- Rate limiting on this route (P06-004 covers /api/analyse, not /api/signal — check if separate rate limiting is needed)
- Frontend changes (P07-006)

## Files Expected to Change

```
backend/src/routes/signal.ts            (new)
backend/src/app.ts or routes/index.ts   (register the route)
```

## Architecture Constraints

- Route requires JWT authentication middleware
- `D-INV-04`: userId comes from JWT, not from request body
- The route awaits the full computation (synchronous from HTTP perspective) — this is intentional

## Acceptance Criteria

1. `POST /api/signal` returns a SignalState JSON response
2. Route is authenticated (no JWT → 401)
3. Returns 200 with updated state
4. Build passes

## Estimated Complexity

M — ~1 hour. Thin route on top of existing orchestrator.

## Claude Execution Guidance

This is a thin route wrapper. Create the route file, add auth middleware, call computeSIGNAL, return the result. No complex logic belongs here.
