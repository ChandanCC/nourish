# P10-003 — Backend Input Validation (Zod)

**Phase:** 10 — Observability & Hardening
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-005
**Unlocks:** (hardening complete)

---

## Purpose

Add Zod schema validation to all write route request bodies.

## Why It Exists

Without validation, malformed request bodies reach service functions and produce confusing errors or silent corruption. Zod validation at the route boundary ensures only valid data reaches the service layer.

## Required Reading

- `architecture/ARCHITECTURE_INVARIANTS.md#E-INV-04` — all writes must be validated

## Exact Scope

Add Zod schemas and validation to:

**POST /api/logs:**
```typescript
z.object({
  description: z.string().min(1).max(500),
  calories: z.number().int().min(0).max(10000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(500),
  fiber: z.number().min(0).max(200).optional(),
  meal_label: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})
```

**PATCH /api/user/onboarding:**
```typescript
z.object({
  goal: z.enum(['muscle_gain', 'fat_loss', 'maintenance', 'performance']),
  protein_target: z.number().int().min(30).max(500)
})
```

Return on validation failure: `422 { error: "validation_error", issues: z.ZodError.issues }`

Create `backend/src/middleware/validate.ts` with a reusable validation middleware factory.

## Files Expected to Change

```
backend/src/middleware/validate.ts      (new — reusable Zod middleware)
backend/src/routes/logs.ts              (apply validation)
backend/src/routes/user.ts              (apply validation)
```

## Architecture Constraints

- `E-INV-04`: validation happens before any service function is called
- Return 422 (not 400) for validation errors — 400 is for structural HTTP errors

## Acceptance Criteria

1. POST /api/logs with missing `calories` → 422
2. POST /api/logs with `calories: "lots"` (string) → 422
3. PATCH /api/user/onboarding with invalid `goal` → 422
4. Valid requests pass through to service functions unchanged
5. Build passes

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

Create a `validate(schema: ZodSchema)` middleware factory: `(req, res, next) => { const result = schema.safeParse(req.body); if (!result.success) return res.status(422).json({ error: 'validation_error', issues: result.error.issues }); req.body = result.data; next(); }`. Apply before the route handler.
