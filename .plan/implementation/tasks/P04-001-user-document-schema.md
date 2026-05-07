# P04-001 — User Document Schema

**Phase:** 04 — Backend Data Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** —
**Unlocks:** P04-006, P05-003, P09-001, P09-005

---

## Purpose

Create the `User` Mongoose model and update the auth route to upsert a User document on first Google OAuth login.

## Why It Exists

Currently the app issues a JWT on login but does not persist a User document. Every downstream intelligence and onboarding feature requires a User document (goal, protein_target, onboarding_complete). This is the foundational identity record.

## Required Reading

- `engineering/data-architecture.md#User` — canonical User schema
- `engineering/backend-architecture.md#auth` — auth route, JWT payload

## Exact Scope

- Create `backend/src/models/User.ts` with Mongoose schema
- Schema fields:
  ```typescript
  {
    _id: ObjectId,
    google_id: string,          // unique index
    email: string,
    goal: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'performance' | null,
    protein_target: number | null,  // grams
    onboarding_complete: boolean,
    created_at: Date,
    updated_at: Date
  }
  ```
- Add indexes: `google_id` (unique), `email` (unique)
- Update the Google OAuth callback route to `findOneAndUpdate` with `upsert: true` on `google_id`
- JWT payload must include `userId` (MongoDB `_id`, not `google_id`)

## Out of Scope

- Onboarding flow UI (Phase 09)
- Setting goal or protein_target (Phase 09)
- User preferences beyond what's listed

## Files Expected to Change

```
backend/src/models/User.ts              (new)
backend/src/routes/auth.ts              (update OAuth callback to upsert User)
```

## Architecture Constraints

- `architecture/ARCHITECTURE_INVARIANTS.md#D-INV-04` — all queries include userId filter
- `architecture/ARCHITECTURE_INVARIANTS.md#E-INV-03` — JWT_SECRET never in frontend
- The `_id` field (not `google_id`) is the canonical userId used in all other collections

## Acceptance Criteria

1. `User` model exports correctly from `models/User.ts`
2. Google OAuth login creates a new User document if none exists
3. Subsequent logins return the existing User document (upsert, not duplicate)
4. JWT payload contains `userId: user._id.toString()`
5. `google_id` and `email` indexes exist on the collection
6. `npm run build -w backend` passes

## Edge Cases

- Two users with same email from different OAuth providers → `google_id` is the unique key, not `email`
- User document already exists on login → `findOneAndUpdate` with `upsert: true` is idempotent

## Estimated Complexity

M — ~2 hours including auth route update.

## Claude Execution Guidance

Read data-architecture.md for the canonical schema before writing the model. Implement the schema exactly as specified. Update the auth callback to do `User.findOneAndUpdate({ google_id }, { $set: { email } }, { upsert: true, new: true })`. Extract `_id` from the returned document for the JWT payload.
