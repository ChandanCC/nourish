# P07-001 — Home Screen Data Hook

**Phase:** 07 — Frontend–Backend Integration
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-006
**Unlocks:** P07-002, P07-003, P07-004

---

## Purpose

Create the `useHomeScreen` TanStack Query hook that fetches `GET /api/home` and provides `HomeScreenPayload` to all home screen components.

## Why It Exists

All home screen components need data. The hook is the single source of truth for that data. It centralizes loading, caching, and refetch behavior so individual components don't manage their own fetches.

## Required Reading

- `engineering/backend-architecture.md#HomeScreenPayload` — type definition
- Phase 07 phase file: `phases/phase-07-integration.md` — hook design, loading state rules

## Exact Scope

- Create `frontend/src/hooks/useHomeScreen.ts`
- Configure TanStack Query:
  ```typescript
  useQuery({
    queryKey: ['home'],
    queryFn: () => api.get('/api/home'),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
  ```
- Create `frontend/src/lib/api.ts` (or update if exists) with authenticated fetch helper
- Add idempotency key generation to the existing submit handler:
  - Import `crypto.randomUUID()` 
  - Add `'X-Idempotency-Key': crypto.randomUUID()` to POST /api/logs request headers

The hook returns the raw `HomeScreenPayload | undefined`. The calling component handles the undefined case.

## Out of Scope

- Wiring components to the hook data (P07-002, P07-003, P07-004)
- Error handling UI
- Loading spinners

## Files Expected to Change

```
frontend/src/hooks/useHomeScreen.ts     (new)
frontend/src/lib/api.ts                 (new or update — fetch helper with JWT)
frontend/src/components/CommandBar.tsx  (add idempotency key to submit)
```

## Architecture Constraints

- TanStack Query only — no Zustand, no custom cache
- JWT is stored in `localStorage` under key `nouriq_token` (or current convention — check existing auth code)
- No loading spinner or skeleton: if data is undefined, components render empty

## Acceptance Criteria

1. `useHomeScreen()` returns `HomeScreenPayload` after successful fetch
2. Data is refetched on window focus
3. POST /api/logs requests include `X-Idempotency-Key` header
4. Build passes

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Check how the current app sends authenticated requests (find the existing JWT usage). Use the same pattern in the new api.ts helper. The hook is a thin wrapper around `useQuery`. Test by opening browser devtools network tab and confirming GET /api/home fires on page load.
