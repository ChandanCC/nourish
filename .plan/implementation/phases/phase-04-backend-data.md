# Phase 04 — Backend Data Layer

**Status:** NOT_STARTED
**Tasks:** P04-001, P04-002, P04-003, P04-004, P04-005, P04-006
**Estimated duration:** 6–9 hours

---

## Purpose

Establish the production-grade data layer: User documents, updated FoodEntry schema with soft-delete, DayAggregate pre-computation, and the GET /api/home endpoint. After this phase, the backend can serve a home screen payload with real macro data (but not yet SIGNAL state).

---

## Prerequisites

- None. This phase can run in parallel with Phases 01–03.

---

## Exit Conditions (Phase Complete When)

1. A User document is created/retrieved on first Google OAuth login
2. FoodEntry documents support soft-delete, meal_label, and idempotency_key
3. DayAggregate is recomputed synchronously on every FoodEntry create and soft-delete
4. `GET /api/home` returns a HomeScreenPayload with real macro data for today
5. All new MongoDB collections have correct indexes
6. `npm run build -w backend` passes with 0 errors

---

## Tasks

| Task | What it does |
|---|---|
| P04-001 | Creates User Mongoose model with goal, protein_target fields |
| P04-002 | Updates FoodEntry model: deleted_at, meal_label, idempotency_key, source |
| P04-003 | Creates DayAggregate Mongoose model |
| P04-004 | Implements computeDayAggregate(userId, date) service function |
| P04-005 | Updates POST /api/logs and DELETE /api/logs/:id to use DayAggregate + soft-delete |
| P04-006 | Implements GET /api/home endpoint returning HomeScreenPayload |

**Dependency order:** P04-001 and P04-002 can start in parallel. P04-003 → P04-004 → P04-005 → P04-006 are sequential.

---

## Architecture Constraints

- `engineering/data-architecture.md` — canonical entity model and schemas
- `engineering/backend-architecture.md` — HomeScreenPayload type, sync/async boundary
- `decisions/009-sync-async-boundary-dayaggregate.md` — DayAggregate sync, SIGNAL async
- `decisions/010-no-redis-precomputed-docs-as-cache.md` — no Redis, DayAggregate is the cache
- `architecture/ARCHITECTURE_INVARIANTS.md#D-INV-01` — FoodEntry immutable (soft-delete only)
- `architecture/ARCHITECTURE_INVARIANTS.md#D-INV-04` — all queries include userId filter

---

## HomeScreenPayload Type

Define this type identically on both backend and frontend (or share it):

```typescript
interface HomeScreenPayload {
  today: {
    date: string;                    // ISO date
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    entryCount: number;
    targets: {
      calories: number | null;       // null until user profile exists
      protein: number;
    };
  };
  signal: {
    state: string;                   // "READING" initially
    subtitle: string | null;
    delta: string | null;
    patternQualifier: string | null;
    aiInstruction: string | null;
    isStale: boolean;
  };
  waveform: WaveformDay[];           // last 7 days
  userId: string;
}

interface WaveformDay {
  date: string;
  calories: number;
  entryCount: number;
}
```

---

## Key Notes

**User creation on login:** Currently the auth route issues a JWT but does not create a User document. P04-001 requires updating the auth route to upsert a User document on first login.

**Idempotency key:** The frontend must generate a UUID v4 per submit and send it as a header or body field. The backend checks for duplicate keys. This prevents double-submission on network retry. Front-end integration happens in P07 but the backend support is built here.

**DayAggregate date format:** Use ISO date string (YYYY-MM-DD), always in UTC. Do not use JavaScript Date objects as keys.

---

## What Exists After This Phase

- User model with goal + protein_target
- FoodEntry with soft-delete, meal_label, idempotency_key
- DayAggregate computed and updated on every write
- GET /api/home returns real today's data + placeholder signal (READING)
- All backend data operations are correct and production-safe
