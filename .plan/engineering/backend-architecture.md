# Backend & Runtime Architecture

**Status:** Active — v1.1 spec
**Last updated:** 2026-05-07

The runtime architecture for all server-side behavior: service topology, write and read pipelines, async job system, SIGNAL recomputation, AI orchestration, caching, failure handling, and scaling philosophy.

→ `engineering/intelligence-architecture.md` — the computation model this runtime executes
→ `engineering/data-architecture.md` — the entity model this runtime persists
→ `engineering/ai-behavior.md` — prompts and output contracts for AI calls
→ `engineering/stack.md` — current tech stack and constraints

---

## Governing Principle

**The system is a ledger with a brain attached. The ledger is always correct. The brain is always conservative. Neither is ever unavailable.**

Three properties the architecture optimizes for, in this order:

1. **Consistency** — a user's logged data and computed state are always coherent. No ghost writes. No silent failures that produce wrong SIGNAL output.
2. **Explainability** — every state the system emits can be traced to specific inputs and deterministic rules. No black boxes at the output layer.
3. **Operational calm** — the system degrades gracefully. A broken AI call returns the previous state, not an error screen. A slow recompute returns the last result, not a spinner.

---

## 1. Service Topology

### Runtime Model: Modular Monolith on Lambda

The backend is a single Express application with clear internal module boundaries. It deploys as **two Lambda functions** from the same codebase:

```
┌─────────────────────────────────────────────────────────────────┐
│  api-handler Lambda                                             │
│  ─────────────────                                              │
│  All synchronous user-facing requests                           │
│  POST /api/logs, GET /api/home, POST /api/analyse, ...          │
│  Triggered by: API Gateway                                      │
│  Timeout: 29s (API Gateway max)                                 │
│  Memory: 512MB                                                  │
├─────────────────────────────────────────────────────────────────┤
│  job-worker Lambda                                              │
│  ─────────────────                                              │
│  All asynchronous background jobs                               │
│  RECOMPUTE_SIGNAL, RECALIBRATE_BASELINE, GENERATE_INSIGHT       │
│  Triggered by: SQS (or Lambda async invocation at early scale)  │
│  Timeout: 5 minutes                                             │
│  Memory: 512MB                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Both functions share:
- Same TypeScript source tree
- Same MongoDB connection code
- Same service modules (`/services/`, `/ai/`, `/models/`)
- Different entry points (`handler.ts` vs `worker.ts`)

**Why not microservices:**
At the current scale (< 500 DAU, single developer), microservices impose coordination cost without value. The module boundary inside the monolith is the contract — extracting a service is a one-day operation when needed, not a prerequisite.

**Why two Lambda functions instead of one:**
The `job-worker` needs a 5-minute timeout (AI synthesis can be slow). API Gateway caps timeout at 29 seconds. Separate functions = independent timeout configurations. The split also makes the sync/async boundary explicit and auditable.

---

## 2. Internal Module Structure

```
backend/src/
├── handler.ts              ← api-handler Lambda entry point (Express app)
├── worker.ts               ← job-worker Lambda entry point (job dispatcher)
│
├── routes/                 ← Express route handlers (validate, delegate, respond)
│   ├── health.ts           GET /health
│   ├── auth.ts             POST /auth/google
│   ├── analyse.ts          POST /api/analyse
│   ├── logs.ts             GET/POST/DELETE /api/logs
│   ├── home.ts             GET /api/home
│   ├── signal.ts           GET /api/signal (current state)
│   ├── training.ts         POST/GET /api/training
│   └── goal.ts             GET/PUT /api/goal
│
├── services/               ← Business logic (compute, orchestrate, persist)
│   ├── food-entry.ts       create/delete FoodEntry, trigger cascade
│   ├── day-aggregate.ts    recompute DayAggregate from FoodEntry + TrainingSession
│   ├── signal-computation.ts  Tier 1 + Tier 2 (deterministic + statistical)
│   ├── signal-synthesis.ts    Tier 3 (AI synthesis via provider abstraction)
│   ├── baseline.ts         BaselineSnapshot creation and recalibration
│   ├── insight.ts          Insight generation and suppression
│   └── home-screen.ts      home screen hydration query
│
├── jobs/                   ← Async job handlers (dispatched by worker.ts)
│   ├── recompute-signal.ts
│   ├── recalibrate-baseline.ts
│   └── generate-insight.ts
│
├── ai/                     ← AI provider abstraction layer
│   ├── interfaces.ts       NutritionParser, SignalEngine interfaces
│   ├── claude/
│   │   ├── parser.ts       Claude implementation of NutritionParser
│   │   └── signal.ts       Claude implementation of SignalEngine
│   └── prompts/
│       ├── food-parse.ts   food parse system prompt
│       └── signal.ts       signal synthesis system prompt
│
├── middleware/
│   ├── require-auth.ts     JWT validation (all /api/* routes)
│   ├── rate-limit.ts       per-user daily call limits
│   └── request-id.ts       inject X-Request-ID header
│
├── models/                 ← Mongoose schemas (see data-architecture.md)
│   ├── user.ts
│   ├── food-entry.ts
│   ├── training-session.ts
│   ├── day-aggregate.ts
│   ├── signal-state.ts
│   ├── baseline-snapshot.ts
│   ├── goal-profile.ts
│   └── insight.ts
│
└── lib/
    ├── mongo.ts            connection management + graceful shutdown
    ├── queue.ts            job enqueue abstraction (SQS or Lambda invoke)
    ├── logger.ts           structured JSON logger
    └── errors.ts           AppError types, error response formatting
```

Routes are thin. They validate input, call a service function, and return. No business logic in route files.

Services are thick. They own computation, orchestration, and persistence. They are not coupled to HTTP.

---

## 3. API Architecture

### Versioning

No URL versioning in v1.0 (`/api/v1/`). The API is private — consumed only by the owned frontend. Versioning added when a native app requires a stable contract alongside a web frontend.

If a breaking change is needed before versioning: deploy both old and new behavior behind a feature flag keyed to `client_version` in the JWT payload.

### Route Inventory

```
GET  /health                        → { status: "ok", version: "1.0.x" }

POST /auth/google                   → { token, user }
     body: { credential }           Google ID token from frontend

POST /api/analyse                   → { name, calories, protein, carbs, fat, fiber, note }
     body: { text }                 Natural language food description
     auth: required
     rate-limit: 50/user/day

POST /api/logs                      → { entry, day_aggregate }
     body: { mealDate, name, calories, protein, carbs, fat, fiber, note, rawInput }
     auth: required

GET  /api/logs?date=YYYY-MM-DD      → { entries: FoodEntry[] }
     auth: required

DELETE /api/logs/:entryId           → { day_aggregate }
     auth: required

POST /api/training                  → { session, day_aggregate }
     body: { sessionDate, rawInput, durationMinutes, exercises? }
     auth: required

GET  /api/home                      → HomeScreenPayload (see §5)
     auth: required

GET  /api/signal                    → { state, pattern, delta_percent, ai_instruction, confidence, computed_at }
     auth: required

GET  /api/goal                      → GoalProfile (active)
     auth: required

PUT  /api/goal                      → GoalProfile (new version)
     body: { goal, protein_target_g }
     auth: required
```

### Response Envelope

All responses use a consistent shape. No envelope for data payloads (return the resource directly). Errors use a standard structure:

```typescript
// Success — return the resource directly
// POST /api/logs → 201
{ entry: FoodEntry, day_aggregate: DayAggregate }

// Error — always this shape
{
  error: string;           // human-readable, user-facing safe
  code: string;            // machine-readable, for client error handling
  request_id: string;      // X-Request-ID for log correlation
}

// Error codes used
"PARSE_FAILED"             AI returned malformed JSON
"RATE_LIMITED"             User exceeded call limit
"NOT_FOUND"                Resource does not exist for this user
"UNAUTHORIZED"             Missing or invalid JWT
"INVALID_INPUT"            Request body failed validation
"AI_TIMEOUT"               Claude API exceeded timeout
"AI_UNAVAILABLE"           Claude API returned non-200
"INTERNAL"                 Unexpected server error (details never exposed to client)
```

### Input Validation

All POST body validation uses Zod schemas, defined in `routes/`. If Zod parse fails: return 400 with `INVALID_INPUT` before any service call.

```typescript
// Example: POST /api/logs
const CreateLogSchema = z.object({
  mealDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name:       z.string().min(1).max(200),
  calories:   z.number().int().min(0).max(9999),
  protein:    z.number().int().min(0).max(999),
  carbs:      z.number().int().min(0).max(999),
  fat:        z.number().int().min(0).max(999),
  fiber:      z.number().min(0).max(999),
  note:       z.string().max(500).nullable(),
  rawInput:   z.string().min(1).max(1000),
});
```

---

## 4. Write Pipeline

### 4.1 Food Entry Write

This is the primary write operation. It is the most latency-sensitive path.

```
Client
  │
  ▼
POST /api/logs
  │
  ├─ 1. Validate JWT (middleware, < 1ms)
  ├─ 2. Zod schema validation (< 1ms)
  ├─ 3. Insert FoodEntry document (MongoDB, ~10ms)
  ├─ 4. Recompute DayAggregate for mealDate (MongoDB, ~20ms)  ← SYNCHRONOUS
  ├─ 5. Enqueue SignalRecomputeJob for userId (SQS, ~10ms)    ← ASYNC — does not block
  └─ 6. Respond: { entry, day_aggregate }                     ← ~ 50ms total
```

**Step 3:** `FoodEntry` is inserted as a new document. `rawInput` is stored exactly as provided — immutable. All numeric fields are integers (clamped at validation).

**Step 4:** `DayAggregate` for that date is recomputed synchronously because the client needs updated macro totals immediately. This is a simple aggregation: sum all non-deleted FoodEntries for (userId, mealDate). If a DayAggregate document already exists, it is upserted. If none exists, it is created.

**Step 5:** A `RECOMPUTE_SIGNAL` job is placed on the queue. The job does not run before the response — SIGNAL computation is never synchronous on the write path. The user sees updated macros immediately, and updated SIGNAL state on the next home screen load (typically within 30 seconds).

**Step 6:** Returns both the saved entry and the updated day_aggregate. The client can immediately update its local state without a refetch.

### 4.2 Food Entry Delete

```
DELETE /api/logs/:entryId
  │
  ├─ 1. Validate JWT + ownership check (ensure entry.userId === jwt.userId)
  ├─ 2. Soft-delete: set isDeleted=true, deletedAt=now (MongoDB, ~10ms)
  ├─ 3. Recompute DayAggregate for entry.mealDate (MongoDB, ~20ms)  ← SYNCHRONOUS
  ├─ 4. Enqueue SignalRecomputeJob (SQS, ~10ms)
  └─ 5. Respond: { day_aggregate }
```

Hard deletes are not performed. `isDeleted = true` is the deletion mechanism. This preserves the audit trail and allows SIGNAL recomputation to verify historical integrity. See `data-architecture.md#ledger-model`.

### 4.3 Training Session Write

```
POST /api/training
  │
  ├─ 1. Validate JWT + Zod validation
  ├─ 2. Insert TrainingSession document
  ├─ 3. Recompute DayAggregate for sessionDate (now includes training_logged=true)
  ├─ 4. Enqueue SignalRecomputeJob
  └─ 5. Respond: { session, day_aggregate }
```

Training log is natural language text parsed by AI (same proxy endpoint as food) or structured (if the client sends pre-parsed data). The workout parser produces: `{ durationMinutes, trainingType, exercises[], totalVolumeKg }`.

### 4.4 Goal Profile Update

```
PUT /api/goal
  │
  ├─ 1. Validate JWT + Zod validation
  ├─ 2. Set current GoalProfile.supersededAt = now (soft-supersede)
  ├─ 3. Insert new GoalProfile (version + 1, effectiveFrom = now)
  ├─ 4. Enqueue SignalRecomputeJob  ← goal change triggers full recompute
  └─ 5. Respond: { goal_profile }
```

A goal change is treated as a significant event. The SIGNAL recompute will use the new protein target and goal direction immediately.

---

## 5. Read Pipeline — Home Screen Hydration

### The Home Screen Contract

The home screen loads with one request. All data comes from pre-computed documents — no on-demand computation on GET.

```
GET /api/home
  │
  ├─ 1. Validate JWT
  ├─ 2. Parallel read (single $lookup aggregation or 3 parallel queries):
  │      a. SignalState (isCurrentState=true)
  │      b. DayAggregate for today (date=todayKey)
  │      c. DayAggregates for last 7 days (waveform)
  │      d. FoodEntries for today (entry list)
  │      e. GoalProfile (supersededAt=null)
  └─ 3. Compose HomeScreenPayload → respond
```

Response shape:

```typescript
interface HomeScreenPayload {
  signal: {
    state: StateLabel;
    pattern: PatternQualifier;
    delta_percent: number | null;
    ai_instruction: string | null;
    state_days: number;
    confidence: number;
    computed_at: string;          // ISO timestamp — client shows "last updated X ago"
    is_stale: boolean;            // true if a RecomputeJob is queued but not complete
  };
  today: {
    date: string;                 // "YYYY-MM-DD"
    calories: number;
    protein_g: number;
    protein_target_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    protein_adherence_pct: number;
    training_logged: boolean;
    training_type: string | null;
    entries: FoodEntrySlim[];     // name + calories + macros, no rawInput
    is_complete: boolean;         // false = today
  };
  waveform: WaveformDay[];        // last 7 days, oldest first
  goal: {
    goal: 'lose' | 'build' | 'maintain';
    protein_target_g: number;
  };
}

interface WaveformDay {
  date: string;
  calories: number;
  baseline_kcal: number;         // for bar height calculation
  training_logged: boolean;
  has_data: boolean;
}

interface FoodEntrySlim {
  entry_id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}
```

**`is_stale` flag:**
Set to `true` when a `RECOMPUTE_SIGNAL` job is queued but has not yet produced a new `SignalState`. The client renders the existing state with a subtle indicator. It does not trigger a loading state or spinner — the state shown is still the correct last-known state.

**Why no on-demand computation in GET:**
GET /api/home is the hot path. It is called on every app open, every background refresh. It must be fast. All computation is done on the write path, stored as documents, read without further computation. The home screen is a read view over pre-computed state, not a computation trigger.

### Per-Day Detail

```
GET /api/logs?date=YYYY-MM-DD
  │
  └─ query FoodEntries where (userId, mealDate=date, isDeleted=false)
     → FoodEntry[] (full objects for entry list rendering)
```

This is a simple indexed query. No computation. Fast.

---

## 6. SIGNAL Recomputation Flow

### Overview

SIGNAL recomputation is the most complex operation in the system. It runs asynchronously, always triggered by a job. It never runs inside a synchronous API call.

```
SignalRecomputeJob received by job-worker
  │
  ├─ 1. Load context: last 14 days of DayAggregates, GoalProfile, BaselineSnapshot
  ├─ 2. TIER 1: Run deterministic checks
  │      ├─ checkReadingTrigger → fires? → return READING immediately
  │      └─ checkUnderfuelledTrigger → fires? → return UNDERFUELLED immediately
  ├─ 3. TIER 2: Run statistical computation
  │      ├─ computeCV, computePatternSlope
  │      ├─ computeConfidenceScore
  │      └─ qualifyStateCandidates
  ├─ 4. Guard: confidence < 50 → return READING (no AI call)
  │      candidate_states empty → return DRIFTING (no AI call)
  ├─ 5. TIER 3: Call Claude API (if guards pass)
  │      ├─ timeout: 15s
  │      ├─ validate output (state in candidates, instruction ≤ 120 chars)
  │      └─ on timeout or error → fallback (see §11)
  ├─ 6. Persist SignalState
  │      ├─ Set previous currentState.isCurrentState = false
  │      └─ Insert new SignalState with isCurrentState = true
  ├─ 7. Enqueue GenerateInsightJob (low priority)
  └─ 8. Complete
```

### Deduplication

Multiple writes in quick succession (user logging 5 items) should not trigger 5 SIGNAL recomputes. Deduplication is enforced at two levels:

**Level 1 — Queue deduplication:**
Each `RECOMPUTE_SIGNAL` job carries a `messageGroupId = userId` and a `messageDeduplicationId = ${userId}_${Math.floor(Date.now() / 60000)}` (minute-bucketed). SQS FIFO drops duplicate messages within a 5-minute window. In practice this means: the first write after a 5-minute gap triggers a recompute; additional writes within 5 minutes share the same job.

**Level 2 — Worker check:**
At job start, the worker checks: is there a newer `RECOMPUTE_SIGNAL` message in the queue for this userId? If the SQS message's `ApproximateReceiveCount` > 1, it means this message was already processed or there is a duplicate — handle accordingly.

At early scale (pre-SQS): use a MongoDB `recompute_locks` document keyed by userId with a 60-second TTL. If a lock exists when a job arrives, skip and let the next delivery process it.

### Recompute Window

Signal recomputation looks at the **last 14 days** of DayAggregates (not raw FoodEntries). The 14-day window is the behavioral context window. Only days with `has_data = true` count toward the logged day totals.

The recompute does not re-examine FoodEntries directly — DayAggregates are the materialized input to SIGNAL computation. This is critical: it means DayAggregate must always be up-to-date before a SignalRecompute runs. The write pipeline guarantees this (synchronous DayAggregate recompute before async SignalRecompute enqueue).

---

## 7. Async Job Architecture

### Job Types

```typescript
type JobType =
  | 'RECOMPUTE_SIGNAL'           // triggered by: food entry write/delete, training write, goal update
  | 'RECALIBRATE_BASELINE'       // triggered by: every 10 logged days
  | 'GENERATE_INSIGHT'           // triggered by: after SIGNAL recompute completes
  | 'DAILY_SNAPSHOT'             // triggered by: EventBridge scheduled (midnight UTC)

interface Job {
  type: JobType;
  userId: string;
  payload: Record<string, unknown>;
  enqueued_at: string;           // ISO timestamp
  attempt: number;               // 1 on first attempt
}
```

### Job Contracts

**RECOMPUTE_SIGNAL**
```typescript
payload: {
  triggered_by: 'log_entry' | 'log_delete' | 'training_entry' | 'goal_change' | 'recalibration';
  reference_date: string;       // "YYYY-MM-DD" — the date that changed
}
```
Produces: new `SignalState` document, queues `GENERATE_INSIGHT`.

**RECALIBRATE_BASELINE**
```typescript
payload: {
  triggered_by: 'log_count_threshold' | 'schedule' | 'goal_change';
  logged_day_count: number;
}
```
Produces: new `BaselineSnapshot` document (isCurrent=true), queues `RECOMPUTE_SIGNAL`.

**GENERATE_INSIGHT**
```typescript
payload: {
  signal_state_id: string;      // ID of the just-computed SignalState
}
```
Produces: new `Insight` document (may be null text if system chooses silence).

**DAILY_SNAPSHOT**
```typescript
payload: {
  target_date: string;          // "YYYY-MM-DD" — yesterday
}
```
Marks yesterday's DayAggregate as `isComplete = true` for all users who logged data. Also runs `RECALIBRATE_BASELINE` if threshold met.

### Queue Infrastructure

**v1.0 (current) — Lambda Async Invocation:**
```typescript
// queue.ts — simplified at early scale
export async function enqueueJob(job: Job): Promise<void> {
  await lambda.invoke({
    FunctionName: process.env.WORKER_LAMBDA_ARN,
    InvocationType: 'Event',    // async, no response waited
    Payload: JSON.stringify(job),
  }).promise();
}
```

No SQS infrastructure needed. Jobs can silently fail (Lambda async invocation has no DLQ by default). Acceptable for sub-100 users — monitor CloudWatch for invocation errors.

**v1.1+ — SQS FIFO:**
When reliability is needed:

```
api-handler Lambda
  └─ enqueues job to: nouriq-jobs.fifo (SQS FIFO)
  
SQS FIFO Queue
  ├─ message group: userId (per-user ordering)
  ├─ deduplication window: 5 minutes
  ├─ visibility timeout: 90s (enough for AI synthesis)
  └─ dead letter queue: nouriq-jobs-dlq (after 3 failures)

job-worker Lambda
  └─ triggered by SQS event
  └─ processes one job at a time per user group
```

The migration is mechanical: swap the `enqueueJob` implementation in `queue.ts` from Lambda invoke to SQS send. No other changes.

### Job Processing Rules

1. **Idempotent by design** — every job can be run multiple times with the same outcome. SIGNAL recompute with the same input data produces the same SignalState.
2. **No side-channel state** — jobs do not pass computed state between them. Each job reads fresh from MongoDB.
3. **Ordered per user** — SQS FIFO message groups enforce that RECOMPUTE_SIGNAL for a user is processed before the subsequent GENERATE_INSIGHT.
4. **No cascading failure** — GENERATE_INSIGHT failure does not invalidate the SignalState. It is a separate document; the SignalState is persisted regardless.

---

## 8. DayAggregate Recomputation

The `DayAggregate` is the most frequently recomputed document. It is recomputed synchronously on every food/training write. The computation is deterministic and fast.

```typescript
async function recomputeDayAggregate(userId: string, date: string): Promise<DayAggregate> {
  const [entries, session, goal] = await Promise.all([
    FoodEntry.find({ userId, mealDate: date, isDeleted: false }),
    TrainingSession.findOne({ userId, sessionDate: date }),
    GoalProfile.findOne({ userId, supersededAt: null }),
  ]);

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + e.calories,
    proteinG: acc.proteinG + e.proteinG,
    carbsG: acc.carbsG + e.carbsG,
    fatG: acc.fatG + e.fatG,
    fiberG: acc.fiberG + e.fiberG,
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 });

  const proteinTarget = goal?.proteinTargetG ?? 0;
  const adherence = proteinTarget > 0 ? totals.proteinG / proteinTarget : 0;

  const today = new Date().toISOString().split('T')[0];

  return DayAggregate.findOneAndUpdate(
    { userId, date },
    {
      ...totals,
      proteinTargetG: proteinTarget,
      proteinAdherencePct: adherence,
      trainingLogged: !!session,
      totalVolumeKg: session?.totalVolumeKg ?? null,
      isComplete: date < today,             // today is never "complete"
      computedAt: new Date(),
      goalProfileVersion: goal?.version ?? 0,
    },
    { upsert: true, new: true }
  );
}
```

**Important invariant:** The `proteinTargetG` and `goalProfileVersion` fields are **snapshots at recompute time**. If the user changes their goal, old DayAggregates retain their historical target — this is correct for historical DELTA display. The SIGNAL recompute always uses the *current* GoalProfile for forward-looking analysis.

---

## 9. AI Orchestration

### Provider Abstraction

All AI calls go through a provider interface. The rest of the system never calls Anthropic directly.

```typescript
// ai/interfaces.ts

interface NutritionParser {
  parse(rawInput: string): Promise<ParsedNutrition>;
}

interface SignalEngine {
  computeState(context: SignalComputationContext): Promise<SignalResult>;
}

interface ParsedNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  note: string | null;
}
```

The `ClaudeNutritionParser` and `ClaudeSignalEngine` are the current implementations. To switch providers: implement the interface, swap the constructor in `handler.ts`. The rest of the system is unaffected.

### Food Parsing Flow

```
POST /api/analyse
  │
  ├─ 1. Rate limit check: user < 50 calls today?
  ├─ 2. Call NutritionParser.parse(text)
  │      ├─ build system prompt + user message
  │      ├─ call Claude API: model=claude-sonnet-4-6, max_tokens=256, timeout=10s
  │      ├─ extract JSON from response (with fallback extraction)
  │      └─ validate: all required fields present, no negative values (clamp to 0)
  ├─ 3. Increment rate limit counter for userId
  └─ 4. Return ParsedNutrition
```

The `/api/analyse` endpoint does **not** save anything. It is a pure transformation endpoint. The client calls it, shows the result to the user for confirmation, then calls `POST /api/logs` to save.

### SIGNAL Synthesis Flow

```
job-worker: RECOMPUTE_SIGNAL job
  │
  ├─ 1. Tier 1 + Tier 2 computation (deterministic, no AI)
  ├─ 2. Guards: confidence < 50 → skip AI, return READING/DRIFTING
  ├─ 3. Call SignalEngine.computeState(context)
  │      ├─ build computation context (ComputedSummary, not raw logs)
  │      ├─ call Claude API: model=claude-sonnet-4-6, max_tokens=512, timeout=15s
  │      ├─ validate output: state in candidate_states, instruction ≤ 120 chars
  │      └─ strip prohibited instruction patterns (regex check)
  └─ 4. If AI call fails → use deterministic fallback (see §11)
```

### AI Call Parameters

```typescript
// Food parsing
const foodParseConfig = {
  model:      'claude-sonnet-4-6',
  max_tokens: 256,
  timeout_ms: 10_000,
  system:     FOOD_PARSE_SYSTEM_PROMPT,    // from ai/prompts/food-parse.ts
};

// SIGNAL synthesis
const signalSynthesisConfig = {
  model:      'claude-sonnet-4-6',
  max_tokens: 512,
  timeout_ms: 15_000,
  system:     SIGNAL_SYNTHESIS_SYSTEM_PROMPT,  // from ai/prompts/signal.ts
};
```

**Temperature:** `0` for both. SIGNAL synthesis must be deterministic for the same inputs. Food parsing must be consistent. Do not use non-zero temperature.

**System prompt updates:** Prompts live in `ai/prompts/`. When a prompt changes, update the file and document in `DECISION_LOG.md`. The model does not change without an explicit decision — not as a performance optimization, not to reduce cost without review.

---

## 10. Caching & Pre-Computation Strategy

**There is no caching layer (Redis, Memcached, CDN edge cache for API).** Instead, the system uses **persisted pre-computation**: expensive computations are run once and stored as documents. Fast reads serve pre-computed state.

```
Expensive operation          Persisted result           Read by
─────────────────────────────────────────────────────────────────
Daily macro summation        DayAggregate               GET /api/home
7-day trend computation      SignalState.deltaPercent   GET /api/home
Weighted median baseline     BaselineSnapshot           SIGNAL recompute
AI state synthesis           SignalState                GET /api/home, GET /api/signal
Insight generation           Insight                    GET /api/home (future)
```

**Lambda connection reuse:** MongoDB connections are initialized outside the Lambda handler function (module-level `mongoose.connect()`). Lambda reuses warm instances, so the connection is reused across invocations in the same container. Cold start pays the connection cost once (~200ms); subsequent requests reuse it. This is the only "caching" at the Lambda level.

**TanStack Query on the frontend:** Client-side caching is handled by TanStack Query's staleTime configuration:
- `/api/home`: staleTime = 30s (data is fresh enough for 30 seconds)
- `/api/logs`: staleTime = 0 (always fresh — user just logged something)
- `/api/signal`: staleTime = 60s

**What is never cached:** JWT validation. Token authenticity is checked on every request. The JWT contains its own claims; no database lookup is needed to validate it.

---

## 11. Failure Handling & Fallback Behavior

### AI Failures — Food Parsing

```
Claude returns malformed JSON      → 422, error: "PARSE_FAILED"
Claude times out (> 10s)           → 504, error: "AI_TIMEOUT"
Claude API returns 5xx             → 502, error: "AI_UNAVAILABLE"
Claude returns negative values     → clamp to 0, do not reject
Claude returns 0 calories          → accept (water, zero-cal entries are valid)
Claude returns calories > 9999     → reject, error: "PARSE_FAILED" (nonsense value)
```

The user always sees an actionable error message. They can retry. No partial state is written.

### AI Failures — SIGNAL Synthesis

SIGNAL failures never surface to the user as errors. The system degrades gracefully:

```
Claude times out (> 15s)      → retain last SignalState, mark signal_stale=true
Claude returns invalid state   → retain last SignalState (state not in candidates)
Claude returns malformed JSON  → fallback to deterministic state
Claude API returns 5xx         → retain last SignalState
Job-worker hard crashes        → SQS DLQ catches the message; retry in 30s
```

**Deterministic SIGNAL fallback:**
When AI synthesis is unavailable, the system falls back to Tier 1 + Tier 2 output only. The rule is:
- If Tier 1 safety rules fired → return that state (READING or UNDERFUELLED)
- If confidence < 60 → return DRIFTING
- If the top candidate state has a rule-based qualifier → return that state with `ai_instruction = null`

This means the app always shows a valid, non-null state. The fallback state may be less precise than the synthesized state, but it is never wrong.

### MongoDB Failures

```
Connection timeout               → Lambda returns 503
Query exceeds 5s                 → return 503, do not wait indefinitely
Write fails (duplicate key)      → investigate — this indicates a bug in the write path
Atlas down (scheduled maintenance)
                                 → app shows last loaded state; refetches resume when Atlas recovers
```

MongoDB Atlas M0 has scheduled maintenance windows (typically ~30-second blips). The frontend's TanStack Query handles these transparently — it retries on error, shows the last successful response during the gap.

### Lambda Cold Start

The cold start latency (~800ms) is not a failure, but it affects the user experience on first load. Mitigation:

**Do not spin-warm-up Lambda with cron pings.** It is unnecessary complexity for the current scale. The product opens to a "home screen load" which the user accepts as a brief delay. As daily active users grow, Lambda instances stay warm through organic traffic.

When cold starts become a complaint (measured via CloudWatch p99 latency): add a SAM `ScheduledEvent` to ping `/health` every 5 minutes. One ping, one warmed instance. Not before.

### Job Failures

```
RECOMPUTE_SIGNAL job fails once     → SQS retries after visibility timeout (90s)
RECOMPUTE_SIGNAL job fails 3 times  → moves to DLQ; alert fires; last SignalState retained
RECALIBRATE_BASELINE job fails      → retried; baseline does not change until success
GENERATE_INSIGHT job fails          → retried; if fails 3 times, no insight for that period
                                       (silence is acceptable; wrong insight is not)
```

**DLQ monitoring:** CloudWatch alarm fires when DLQ depth > 0. This means a job has exhausted retries and needs manual investigation. For the current scale, this is a rare event.

---

## 12. Idempotency Strategy

Every mutating operation is idempotent or carries an idempotency key.

### Food Entry Write

The client sends a unique `idempotency_key` (UUID v4 generated at button press) with each `POST /api/logs` request:

```typescript
// Header: Idempotency-Key: <uuid>
```

The backend:
1. Checks MongoDB for an existing `FoodEntry` with `idempotencyKey = uuid` for this `userId`
2. If found: return the existing entry (do not insert duplicate)
3. If not found: insert, store idempotencyKey on the document

This prevents duplicate entries from network retries. The idempotency record is retained for 24 hours (TTL index on `idempotencyKey` field).

**Why not `rawInput` hash for deduplication:**
Users legitimately log the same meal twice in a day ("two protein shakes"). Content-based deduplication would incorrectly block this. UUID-keyed deduplication is keyed to the user's specific intent to log (one button press = one intent = one key).

### SIGNAL Recomputation

Idempotent by design: the same DayAggregates + GoalProfile + BaselineSnapshot always produce the same Tier 1 + Tier 2 output. The AI synthesis (Tier 3) is deterministic at temperature=0 for the same input.

When a SignalRecompute runs and finds that the input state has not changed since the last recompute (same DayAggregate timestamps), it skips the AI call and returns the existing SignalState. This is an optimization, not required for correctness.

### Baseline Recalibration

Triggered only when `loggedDayCount % 10 === 0`. The trigger check uses the total count from `DayAggregate` documents with `isComplete=true`. This count is stable — complete days do not change. Firing twice for the same count is impossible if the trigger check is `=== 0` (not `<= 0`).

---

## 13. Invalidation & Recompute Rules

When data changes, which dependent computations must re-run:

```
Event                                    Immediate sync               Async job queued
─────────────────────────────────────────────────────────────────────────────────────
FoodEntry created (date D)               DayAggregate(D) recompute    RECOMPUTE_SIGNAL
FoodEntry deleted (date D)               DayAggregate(D) recompute    RECOMPUTE_SIGNAL
TrainingSession created (date D)         DayAggregate(D) recompute    RECOMPUTE_SIGNAL
GoalProfile changed                      —                            RECOMPUTE_SIGNAL
                                                                       (full 14-day window)
Logged day count crosses 10/20/30...     —                            RECALIBRATE_BASELINE
                                                                       → then RECOMPUTE_SIGNAL
RECALIBRATE_BASELINE completes           BaselineSnapshot updated     RECOMPUTE_SIGNAL
RECOMPUTE_SIGNAL completes               SignalState updated          GENERATE_INSIGHT
```

### Recompute Scope Decisions

**When does a food entry write trigger a full 14-day recompute vs. just today?**

Always a full 14-day recompute. There is no "partial recompute" mode.

Reasoning: The SIGNAL computation uses the rolling 14-day window. Adding a new entry for *today* changes the 7-day average, the CV, the pattern slope, and potentially the confidence score. All of these affect the final state. A "partial recompute that only updates today's aggregate" is not sufficient — the SIGNAL looks at the pattern, not just the day.

The recompute cost is minimal: it reads 14 DayAggregate documents (lightweight) and calls Claude once (background). Full recompute on every write is correct and cheap.

**When is a food entry for a past date handled?**

If the user logs food for yesterday (common: "I forgot to log dinner"), the cascade runs:
1. FoodEntry inserted for mealDate = yesterday
2. DayAggregate(yesterday) recomputed
3. RECOMPUTE_SIGNAL queued (now reads 14 days including the updated yesterday)

The SIGNAL recompute picks up the change correctly because it reads DayAggregates fresh, including the now-updated yesterday. No special handling needed.

---

## 14. Authentication Architecture

### Current Model (v1.0)

```
Client                       Backend
  │                            │
  ├─ Google OAuth 2.0 ──────→  POST /auth/google
  │  (ID token from Google)    ├─ verifyIdToken(credential, CLIENT_ID)
  │                            ├─ extract: sub, email, name, picture
  │                            ├─ upsert User document (userId = sub)
  │                            ├─ issue JWT: { userId, email, name }
  │                            │            exp: 30 days, signed with JWT_SECRET
  │◄── { token, user } ────────┘
  │
  ├─ All subsequent API calls: Authorization: Bearer <token>
  │
  └─ requireAuth middleware:
       ├─ verify JWT signature + expiry
       ├─ attach { userId, email } to req.user
       └─ proceed to route handler
```

**JWT payload:**
```typescript
interface JWTPayload {
  userId: string;     // Google sub claim — stable, immutable
  email:  string;
  name:   string;
  iat:    number;
  exp:    number;     // iat + 30 days
}
```

**No refresh tokens in v1.0.** When the 30-day token expires, the user re-authenticates via Google (one tap, seamless UX). Token expiry is checked on the frontend at app startup — if the token is expired, the auth state is cleared and the Google sign-in button is shown.

### Path to Refresh Tokens (v1.2+)

When the app is native (Capacitor) or has enough DAU to care about session continuity:

1. Issue a short-lived access token (1 hour) + long-lived refresh token (90 days)
2. Refresh tokens stored in MongoDB with `userId`, `token_hash`, `expires_at`, `revoked_at`
3. Add `POST /auth/refresh` endpoint
4. Access token checked in middleware; refresh handled transparently by the API client

The current architecture does not require changes to support this — it's an additive path.

### Security Notes

**JWT secret:** `JWT_SECRET` in `backend/.env`. Minimum 64 bytes of entropy. Never committed, never logged, never included in responses.

**Token validation:** Every request through `requireAuth` validates signature, expiry, and that `userId` is present. There is no database lookup on token validation — the JWT is self-contained. Speed: < 1ms.

**Ownership verification:** Every resource query includes `userId` as a filter condition. A user cannot read or mutate another user's data even with a valid JWT — the MongoDB query simply returns nothing for mismatched ownership.

---

## 15. Mobile Sync Strategy

### Current Model: Stateless REST

The app has no offline mode. No sync protocol. No conflict resolution.

Each device (or browser tab) is a stateless consumer of the backend. On app open: fetch `/api/home`. On log: POST. On delete: DELETE. On background app return: refetch `/api/home`.

This is correct for the current architecture. The target user logs primarily from a single phone, immediately after a meal.

**Why no sync protocol:**
- A sync protocol (like CRDTs or operational transforms) solves multi-device conflict. Our write model is append-only (food entries are never edited, only deleted). Two devices adding different entries is not a conflict — both writes succeed, both appear in the log.
- The only real conflict is "user logs on two devices at exactly the same time." The idempotency key prevents duplicate entries from that scenario.

### Frontend Sync Behavior

```
App foreground (visibilitychange = visible)    → invalidate /api/home TanStack Query cache
Pull-to-refresh (if implemented later)         → invalidate /api/home + /api/logs
Successful POST /api/logs                      → update local cache with response
                                                  (day_aggregate in response body)
Background timer                               → not implemented; app refreshes on foreground
```

### Future: Native App Sync (v2.0)

When Capacitor is added (see `future/native-app.md`):

1. **Offline write queue:** user can log food offline; writes are queued locally
2. **Queue flush on reconnect:** queued writes are POSTed in chronological order on reconnect
3. **Server reconciliation:** backend processes each write in order; DayAggregate and SIGNAL recompute after all queued writes are processed
4. **Conflict rule:** last-write-wins for goal profile changes. Append-all for food entries (no merging needed — each is a distinct event).

The idempotency key system already supports this: offline writes carry pre-generated UUID keys, and the server deduplicates if the same write is received twice.

---

## 16. Background Recomputation Rules

Some operations run on a schedule, not triggered by user action.

### Daily Snapshot (midnight UTC)

Triggered by EventBridge Scheduled Rule. Runs once per day.

```
For each user who has a DayAggregate for yesterday:
  1. Mark DayAggregate.isComplete = true
  2. Recompute final DayAggregate (in case any late entries)
  3. Check if loggedDayCount % 10 === 0 → enqueue RECALIBRATE_BASELINE
```

**Why midnight UTC, not per-user timezone:**
Simplicity. The daily snapshot runs once for all users at the same time. The behavioral date "yesterday" uses the server's UTC date, which may not match the user's local date. For most users (most timezones), the discrepancy is acceptable. If per-user timezone completion matters (it does): store `User.timezone` (IANA string) and trigger per-user daily snapshots at the user's midnight. This is a v1.2 improvement.

### Baseline Recalibration (triggered by log count)

Not scheduled. Triggered when `completeLoggedDays % 10 === 0` on a daily snapshot run.

The baseline is recomputed using the weighted median algorithm:
```
1. Fetch all DayAggregates where isComplete=true for this user
2. Apply exponential decay weights (λ=0.04) based on days-ago
3. Compute weighted median of calories (not mean — resistant to outlier days)
4. If result differs from current BaselineSnapshot by > 5%: create new version
5. Enqueue RECOMPUTE_SIGNAL (new baseline changes DELTA calculation)
```

The `is_established = true` flag is set when `loggedDaysUsed >= 7`. Before establishment, the baseline is used but marked as preliminary.

### SIGNAL Recency Decay

The system does not proactively degrade the SIGNAL state if the user stops logging. The SIGNAL reflects the last-computed state until the user logs again. Staleness is indicated via `computed_at` timestamp (the home screen shows "last updated 2 days ago").

The Tier 1 rule handles sparse data correctly: if `logged_days_last_14 < 3`, the state returns to READING. This triggers naturally when a new SignalRecompute runs after a return-from-absence log entry.

---

## 17. Model Provider Abstraction

The system must be able to change AI providers (or run a fine-tuned model) without changing business logic.

### Interface Contract

```typescript
// ai/interfaces.ts

interface NutritionParser {
  parse(rawInput: string, options?: ParseOptions): Promise<ParsedNutrition>;
}

interface SignalEngine {
  computeState(context: SignalComputationContext): Promise<SignalResult>;
}

interface ParseOptions {
  timeout_ms?: number;
  model_override?: string;    // for A/B testing; normally null
}

// Each implementation registers with the factory
interface AIProviderFactory {
  getNutritionParser(): NutritionParser;
  getSignalEngine(): SignalEngine;
}
```

### Current Implementation: Claude

```typescript
// ai/claude/parser.ts
export class ClaudeNutritionParser implements NutritionParser {
  constructor(private client: Anthropic) {}

  async parse(rawInput: string, options?: ParseOptions): Promise<ParsedNutrition> {
    const response = await this.client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 256,
      system:     FOOD_PARSE_SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: rawInput }],
    });
    return this.validateAndExtract(response.content[0]);
  }

  private validateAndExtract(content: MessageParam): ParsedNutrition {
    const json = extractJSON(content.text);
    // validate shape, clamp negatives, return
  }
}
```

### Model Version Pinning

**Pin the model version explicitly.** Never use a `latest` alias. When Anthropic releases a new model version:

1. Test it against the food parsing + SIGNAL synthesis prompt suite
2. If output quality is equal or better: update the model string in both prompt files
3. Document the change in `DECISION_LOG.md`
4. Deploy with observation period (compare new model's instruction quality vs. previous)

The model string is in `ai/prompts/food-parse.ts` and `ai/prompts/signal.ts` — two places only.

---

## 18. Rate Limiting Strategy

Rate limiting protects against API cost abuse and accidental loops.

### Limits

```
Endpoint              Limit              Window     Enforcement
────────────────────────────────────────────────────────────────
POST /api/analyse     50 calls/user      24h        MongoDB counter
POST /api/logs        200 entries/user   24h        MongoDB counter
DELETE /api/logs      200 deletes/user   24h        MongoDB counter
POST /api/training    50 sessions/user   24h        MongoDB counter
POST /auth/google     20 attempts/IP     1h         In-memory (Lambda instance)
```

The `/api/analyse` limit of 50 is generous — a user logging 3 meals + 2 snacks is 5 calls. 50 allows 10× normal usage. At 50 calls/user/day × $0.002/call = $0.10/user/day maximum cost.

### Implementation

```typescript
// Rate limit document in MongoDB
// Collection: rate_limits
// TTL index on expiresAt (documents auto-delete at midnight)
interface RateLimitRecord {
  _id: string;              // compound: `${userId}:${endpoint}:${dateKey}`
  count: number;
  limit: number;
  expiresAt: Date;          // midnight UTC of current day
}

// middleware/rate-limit.ts
async function checkRateLimit(userId: string, endpoint: string, limit: number): Promise<void> {
  const key = `${userId}:${endpoint}:${getTodayKey()}`;
  const record = await RateLimit.findOneAndUpdate(
    { _id: key },
    { $inc: { count: 1 }, $setOnInsert: { limit, expiresAt: getEndOfDay() } },
    { upsert: true, new: true }
  );
  if (record.count > limit) {
    throw new RateLimitError(`Daily limit of ${limit} exceeded for ${endpoint}`);
  }
}
```

MongoDB `$inc` + `upsert` is atomic. No race condition. No Redis needed.

---

## 19. Observability & Logging

### Structured Logging

Every log line is JSON. No unstructured `console.log`. The logger in `lib/logger.ts` wraps a JSON emitter (or pino in v1.2 if performance is needed).

```typescript
// lib/logger.ts
interface LogEvent {
  timestamp:   string;      // ISO 8601
  level:       'info' | 'warn' | 'error';
  request_id:  string;      // X-Request-ID header value
  user_id:     string | null;
  event:       string;      // snake_case event name
  duration_ms: number | null;
  data:        Record<string, unknown>;
}

// Event names
'api.request.received'
'api.request.completed'    data: { status_code, duration_ms }
'api.request.failed'       data: { error_code, message }

'food.parse.started'
'food.parse.completed'     data: { model, input_tokens, output_tokens, duration_ms }
'food.parse.failed'        data: { error_type, duration_ms }

'food.entry.created'       data: { meal_date, calories }
'food.entry.deleted'       data: { meal_date }

'day_aggregate.recomputed' data: { date, entry_count, duration_ms }

'signal.recompute.started'  data: { trigger_type }
'signal.recompute.tier1'    data: { reading_triggered, underfuelled_triggered }
'signal.recompute.tier2'    data: { confidence, candidate_states, cv_7d }
'signal.recompute.tier3'    data: { model, state, duration_ms }
'signal.recompute.fallback' data: { reason, returned_state }
'signal.recompute.completed' data: { state, pattern, duration_ms }

'baseline.recalibration'    data: { logged_days_used, old_kcal, new_kcal, version }

'job.enqueued'              data: { job_type, user_id }
'job.started'               data: { job_type, attempt }
'job.completed'             data: { job_type, duration_ms }
'job.failed'                data: { job_type, attempt, error }

'rate_limit.exceeded'       data: { endpoint, user_id, limit }
'auth.success'              data: { user_id }
'auth.failed'               data: { reason }
```

**What is never logged:**
- JWT token values
- Google OAuth credentials
- Raw food entry text (contains personal health data)
- `rawInput` from food entries
- Anthropic API key

**What is always logged:**
- Every request (received + completed, with duration)
- Every AI call (started + completed + duration + token counts)
- Every SIGNAL recompute (tier outcomes, final state)
- Every job (enqueued + started + completed/failed)
- Every error (with request_id, error_code, never stack trace in production)

### CloudWatch Dashboards

In production, CloudWatch receives all Lambda stdout (structured JSON). Key metrics to monitor:

```
Lambda
  p50/p95/p99 duration for api-handler
  p50/p95/p99 duration for job-worker
  Error rate (4xx vs 5xx separately)
  Cold start frequency

AI
  food.parse duration p95 (alert if > 8s — approaching timeout)
  signal.recompute.tier3 duration p95 (alert if > 12s)
  food.parse failure rate (alert if > 5%)

Business
  food entries created per day (organic growth signal)
  signal recompute success rate
  baseline recalibrations per week

Infrastructure
  MongoDB Atlas connection pool exhaustion
  SQS DLQ depth (alert if > 0)
  Rate limit exceeded frequency (user education signal)
```

---

## 20. Scaling Philosophy

### Do Not Optimize Prematurely

The system is designed for calm, not for scale. It currently supports ~50 DAU comfortably on M0 + Lambda free tier. The design does not require changes to support 500 DAU. It requires changes at ~5,000 DAU.

Scale decisions are triggered by observable signals, not hypothetical load:

```
Signal                          Action
──────────────────────────────────────────────────────────────
MongoDB > 400MB used            Upgrade Atlas M0 → M10 ($57/mo)
Lambda p99 > 3s on hot paths    Add Lambda warmer + investigate query indexes
SQS DLQ depth > 0 for > 1h     Investigate job failures; add DLQ alarm
AI cost > $50/month             Implement request batching for bulk log days
Baseline recalibration >         Add background scheduling queue; avoid
all users at midnight UTC        thundering herd
Food parse p99 > 8s              Investigate Claude latency; add timeout circuit breaker
MongoDB query > 200ms avg        Add specific compound indexes; review aggregation pipelines
```

### Vertical First

The upgrade path is:

```
Layer             v1.0             v1.1             v2.0
────────────────────────────────────────────────────────────
Database         M0 (free)        M10 ($57/mo)     M20 ($120/mo)
Lambda memory    512MB            512MB            1024MB (if cold start matters)
Queue            Lambda async     SQS FIFO         SQS FIFO (unchanged)
AI               claude-sonnet    claude-sonnet    claude-opus (if quality gap found)
Cache            None             None             Read replica or ElastiCache
```

No architectural change is needed at M10. The connection string changes; the code does not.

### The Extraction Path

If a specific service needs to scale independently, extraction follows module boundaries:

```
Service to extract          Module to extract       New deployment
────────────────────────────────────────────────────────────────
AI food parsing             routes/analyse.ts +     Lambda + API Gateway
                            ai/claude/parser.ts      (separate function)

SIGNAL computation          services/signal-*.ts +   Lambda Worker (already done)
                            jobs/recompute-signal.ts

Baseline recalibration      services/baseline.ts +   EventBridge + Lambda
                            jobs/recalibrate-*.ts     (scheduled rule)

Weekly report generation    (future service)         Lambda + SES
```

Extraction does not require infrastructure changes — Lambda already provides function-level isolation. The "modular monolith" is modular precisely so extraction is copy-and-deploy.

---

## Summary: Sync vs. Async Boundaries

```
Operation                           Sync or Async      User waits
──────────────────────────────────────────────────────────────────
Food entry AI parsing               Sync               Yes (sees result to confirm)
Food entry save                     Sync               Yes (sees saved state)
DayAggregate recomputation          Sync               Yes (macro totals update instantly)
Food entry delete                   Sync               Yes (macro totals update instantly)
Training session save               Sync               Yes
Goal profile update                 Sync               Yes
JWT validation                      Sync               Yes (< 1ms)

SIGNAL recomputation (Tier 1+2)     Async (job)        No
SIGNAL synthesis (Tier 3, AI)       Async (job)        No
Baseline recalibration              Async (job)        No
Insight generation                  Async (job)        No
Daily snapshot (mark complete)      Async (scheduled)  No
```

**The sync/async boundary is the DayAggregate.** Anything that updates the user's macro totals for the day is synchronous. Anything that updates pattern analysis or AI-derived state is asynchronous.

This is the right division. Macro counts are facts — the user just said they ate something and they need to see the updated number. SIGNAL is inference — it cannot be more current than the data behind it, and running AI synthesis while the user waits for a save confirmation is wrong.

---

## Summary: Failure Modes and Their Responses

```
Failure                   Response                 User experience
──────────────────────────────────────────────────────────────────
AI parsing fails           Return error             "Couldn't parse that. Try again."
AI synthesis fails         Retain previous SIGNAL   Sees last computed state (correct)
DayAggregate recompute     Return error             Save fails; user retries
  fails
MongoDB unavailable        Return 503               App shows offline state
Lambda cold start          ~800ms added latency     Barely perceptible on tap
SIGNAL job fails 3×        DLQ; manual resolution   User sees stale SIGNAL; is_stale=true
Baseline recalibration     Retry; old baseline      DELTA uses prior baseline (slightly
  fails                    retained                  less accurate, not wrong)
Google OAuth timeout       Return error on login    "Sign-in failed. Try again."
Rate limit exceeded        Return 429               "Daily limit reached." (rare)
```

The common theme: every failure produces the previous correct state or a specific error message. No failure produces an incorrect state or a silent wrong answer.

---

*This document defines the runtime behavior. Implementation follows `PROJECT_STATE.md` priority queue.*
*Update this document when architectural decisions change — do not let it drift from implementation.*
