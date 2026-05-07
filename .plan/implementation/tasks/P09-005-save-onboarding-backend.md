# P09-005 — Save Onboarding Data (Backend)

**Phase:** 09 — Onboarding Flow
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-001
**Unlocks:** P09-006

---

## Purpose

Implement `PATCH /api/user/onboarding` to save goal and protein_target to the User document and mark onboarding as complete.

## Why It Exists

The onboarding screens collect goal and protein target. This endpoint persists them to the User document, setting `onboarding_complete: true`.

## Exact Scope

- Create `PATCH /api/user/onboarding` route
- Request body:
  ```typescript
  {
    goal: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'performance';
    protein_target: number;  // grams, integer
  }
  ```
- Update User document: `{ goal, protein_target, onboarding_complete: true }`
- Return updated User document (without sensitive fields)
- Validate body (Zod or manual):
  - `goal` must be one of the 4 valid values
  - `protein_target` must be integer, 30–500 range

## Files Expected to Change

```
backend/src/routes/user.ts              (new or update — add PATCH /onboarding)
backend/src/app.ts or routes/index.ts   (register the route)
```

## Architecture Constraints

- Route requires JWT authentication
- `D-INV-04`: userId comes from JWT, not body
- Set `onboarding_complete: true` atomically with the other fields in the same update

## Acceptance Criteria

1. PATCH /api/user/onboarding with valid body updates User document
2. `onboarding_complete` is set to true
3. Invalid goal value → 400
4. protein_target out of range → 400
5. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Thin route: validate body, findOneAndUpdate the User with `{ goal, protein_target, onboarding_complete: true }`, return the updated doc. Use `new: true` option to return the updated document.
