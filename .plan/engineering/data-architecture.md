# Data Architecture

**Status:** Active — v1.1 spec
**Last updated:** 2026-05-07

The canonical entity model for Nouriq. Every database schema, API response, and computation derives from this document.

→ `engineering/intelligence-architecture.md` — how computed entities are derived
→ `engineering/ai-behavior.md` — AI prompts and contracts (use entity types defined here)
→ `engineering/stack.md` — MongoDB Atlas as the persistence layer

---

## Governing Principle

**Raw events are facts. Computed values are derived truths. Neither should be conflated.**

A food log is a fact: the user stated they ate something, at a time, and the AI parsed it. That fact does not change retroactively. What changes is the system's analysis of accumulated facts — and that analysis is computed, versioned, and preserved as historical snapshots.

The architecture borrows from three reference models:

| Reference | What we take from it |
|---|---|
| Stripe ledger | Events are immutable; balance is derived. Correction = new event, not mutation. |
| Git object model | Content-addressable history; nothing is overwritten, only superseded. |
| WHOOP behavioral history | Computed state snapshots preserve what the system believed at each point in time. |

---

## 1. Entity Classification

Every entity belongs to exactly one class:

```
RAW EVENTS        Created by user action. Soft-deletable. Immutable fields after creation.
                  FoodEntry, TrainingSession, ExerciseSet

VERSIONED STATE   Replaced by creating a new version, never mutated.
                  GoalProfile, BaselineSnapshot

COMPUTED STATE    Derived from raw events. Persisted for performance and historical truth.
                  DayAggregate, SignalState

DERIVED CACHE     Computed on demand, safe to recompute at any time.
                  PatternWindow (ephemeral computation artifact)

SYSTEM EVENTS     Append-only audit records. Never deleted.
                  RecalibrationEvent, Insight

IDENTITY          Mutable within defined fields. Core identity immutable.
                  User
```

**Immutability hierarchy:**

```
Most immutable ─────────────────────────────────────────── Least immutable

SignalState      BaselineSnapshot    DayAggregate    FoodEntry      User
RecalibrationEvent  GoalProfile      (recomputed)    (soft-delete)  (profile fields)
Insight
```

---

## 2. Entity Catalog

---

### Entity: User

**Purpose:** Identity root. All other entities are owned by a User.

**Ownership:** Created on first Google OAuth login. Persists indefinitely.

**Mutability:** `name`, `picture` update on re-authentication if Google profile changed. `googleId` and `email` are immutable after creation.

**Lifecycle:** Created once. No deletion in v1.1 (account deletion is a future feature).

```typescript
interface User {
  _id:         ObjectId;
  googleId:    string;          // Google OAuth sub claim — immutable
  email:       string;          // immutable
  name:        string;          // updates on re-auth if changed
  picture:     string;          // URL — updates on re-auth
  createdAt:   Date;
  lastSeenAt:  Date;
  timezone:    string;          // IANA timezone — "America/New_York"
                                // Set at first login from browser locale
                                // User can update in settings
}
```

**Relationships:** Root. All other entities reference User via `userId`.

**Timezone handling:** All date logic (mealDate, sessionDate, DayAggregate.date) uses the user's declared timezone to determine which calendar day an event belongs to. A log at 11:58pm local time belongs to that local day, not UTC tomorrow. This is stored on User and used in all date computations.

---

### Entity: GoalProfile

**Purpose:** The user's declared intent — what they are training for and what protein level they are targeting.

**Ownership:** User. Created at onboarding; replaced (new version created) when goal changes.

**Mutability:** Immutable once created. Goal changes create a new GoalProfile with `supersededAt` set on the previous one.

**Lifecycle:** Created → active (current = true) → superseded (when goal changes, current = false, supersededAt set).

```typescript
interface GoalProfile {
  _id:                 ObjectId;
  userId:              ObjectId;
  version:             number;           // 1, 2, 3... increments on each change
  
  goal:                "lose" | "build" | "maintain";
  proteinTargetG:      number;           // user-declared or pre-filled
  surplusDeficitLevel: "gentle" | "standard" | null;  // null for maintain
  
  effectiveFrom:       Date;             // when this goal became active
  supersededAt:        Date | null;      // null = currently active
  supersededByVersion: number | null;   
  
  createdAt:           Date;
}
```

**Relationships:**
- `userId` → User
- `DayAggregate.goalProfileVersion` → GoalProfile.version (snapshot)
- `SignalState.goalProfileVersion` → GoalProfile.version (snapshot)

**Recomputation rules:**
When a new GoalProfile is created:
1. Future DayAggregates use the new `proteinTargetG` for adherence calculation
2. Historical DayAggregates preserve their `proteinTargetG` snapshot — they do NOT recompute
3. SignalState resets to READING for 3 logged days (new goal context, recalibration)
4. Baseline is NOT reset — behavioral caloric baseline is independent of declared goal

**Why goal changes don't retroactively alter history:**
A user who changes from LOSE to BUILD has a historical record showing CUTTING state. That state was accurate at the time. Retroactively relabeling it as DRIFTING or BUILDING would corrupt the historical truth. The state history shows the journey.

---

### Entity: FoodEntry

**Purpose:** A single logged food event — one item or meal as typed by the user and parsed by the AI.

**Ownership:** User. Created by user action. The user is the source of truth for what they consumed.

**Mutability:** Core fields (`rawInput`, `parsedAt`, `calories`, macros) are immutable after creation. Only lifecycle fields (`isDeleted`, `deletedAt`) change after creation.

**Lifecycle:** Created → active → soft-deleted (never hard-deleted in v1.1).

```typescript
interface FoodEntry {
  _id:          ObjectId;
  userId:       ObjectId;
  
  // Temporal
  mealDate:     string;          // "YYYY-MM-DD" in user's timezone
                                  // the day this entry counts toward
  loggedAt:     Date;            // exact UTC timestamp of when user submitted
  
  // Raw event
  rawInput:     string;          // exactly what the user typed — never modified
  
  // AI parse result — immutable after creation
  parsedAt:     Date;
  parsedByModel: string;         // "claude-sonnet-4-6" — for future model audits
  name:         string;
  calories:     number;          // kcal, integer
  proteinG:     number;
  carbsG:       number;
  fatG:         number;
  fiberG:       number;
  parseNote:    string | null;   // AI note about assumptions (portion size etc.)
  
  // Lifecycle
  isDeleted:    boolean;
  deletedAt:    Date | null;
  
  // Provenance
  source:       "user_input";    // future: "barcode" | "template" | "import"
}
```

**Relationships:**
- `userId` → User
- `mealDate` determines which DayAggregate this entry contributes to

**Why rawInput is preserved:**
The raw input is the user's statement about their behavior. It is evidence. If the AI parsed "chicken and rice" as 200 kcal and the user later questions the accuracy, the raw input is the ground truth to audit against. It is never modified even if the user re-logs.

**Deletion semantics:**
Soft delete only. `isDeleted = true`, `deletedAt = timestamp`. The entry is excluded from all aggregations but preserved in the database.

Cascade: When a FoodEntry is soft-deleted → trigger DayAggregate recompute for that `mealDate`.

**What deletion does NOT do:**
- Does not retroactively alter SignalState records that were computed before the deletion
- Does not alter BaselineSnapshot records
- Does not create a RecalibrationEvent (baseline recalibration is triggered by logged day count, not real-time)

**The correction mechanism:**
There is no "edit entry" flow. Correction = delete + re-log. This is intentional:
1. It creates a clear audit trail (original parse preserved as deleted record)
2. It avoids the complexity of "which version of this entry was counted in which SignalState?"
3. The time cost is low (re-log is fast with natural language)

---

### Entity: TrainingSession

**Purpose:** A logged workout — one session with optional exercise detail.

**Ownership:** User. Created by user action.

**Mutability:** Immutable after creation except for soft delete. `exercises` array is set at creation and does not change.

```typescript
interface TrainingSession {
  _id:             ObjectId;
  userId:          ObjectId;
  
  // Temporal
  sessionDate:     string;       // "YYYY-MM-DD" in user's timezone
  loggedAt:        Date;
  
  // Session
  rawInput:        string | null;  // what the user typed (if text-logged)
  sessionType:     "push" | "pull" | "legs" | "upper" | "lower" | 
                   "full" | "cardio" | "other";
  durationMinutes: number | null;
  
  // Exercises (embedded — no independent lifecycle)
  exercises:       ExerciseSet[];
  
  // Computed at creation
  totalVolumeKg:   number | null;  // sum of (sets × reps × weight) for all exercises
  
  // Lifecycle
  isDeleted:       boolean;
  deletedAt:       Date | null;
  
  // Provenance
  source:          "user_input";   // future: "healthkit" | "garmin"
}

interface ExerciseSet {
  name:            string;          // "Squat", "Bench Press" etc. (AI-normalized)
  rawName:         string;          // what the user typed — "squat" → "Squat"
  sets:            number | null;
  reps:            number | null;
  weightKg:        number | null;
  isBodyweight:    boolean;
  notes:           string | null;
}
```

**Why ExerciseSet is embedded:**
ExerciseSets have no lifecycle independent of their TrainingSession. They are never queried individually. Embedding avoids a join and keeps the session atomic.

**Volume calculation:**
`totalVolumeKg = Σ (sets × reps × weightKg)` for all non-bodyweight exercises with complete data.
If any exercise is missing reps or weight, `totalVolumeKg` is computed from available data and marked as partial.

**Progressive overload detection:**
Not computed at write time. Computed at query time when the intelligence layer needs to compare current session volume to historical sessions for the same exercise. This is a Tier 2 statistical computation — not stored on the entity.

---

### Entity: DayAggregate

**Purpose:** The materialized summary of everything logged on a single calendar day for a single user. The primary input to SIGNAL computation.

**Ownership:** System-computed from FoodEntry and TrainingSession records.

**Mutability:** Recomputed whenever the underlying raw events change. Persisted for performance. Historical DayAggregates (past days) stabilize and rarely change.

**Lifecycle:** Created when a user first logs an entry for a day. Recomputed on each event that affects that day. Marked `isComplete = true` after the day passes.

```typescript
interface DayAggregate {
  _id:                ObjectId;
  userId:             ObjectId;
  date:               string;       // "YYYY-MM-DD" in user's timezone — the key
  
  // Nutrition totals (from non-deleted FoodEntry records for this date)
  totalCalories:      number;
  totalProteinG:      number;
  totalCarbsG:        number;
  totalFatG:          number;
  totalFiberG:        number;
  entryCount:         number;       // number of non-deleted FoodEntries
  
  // Protein adherence (computed at snapshot time)
  proteinTargetG:     number;       // snapshot from active GoalProfile at this date
  proteinAdherencePct: number;      // 0.0–1.0 (totalProteinG / proteinTargetG)
  
  // Training
  trainingLogged:     boolean;
  trainingSessionIds: ObjectId[];   // references to active (non-deleted) sessions
  totalVolumeKg:      number | null;
  
  // Completeness
  isComplete:         boolean;      // false = today, true = past day
  
  // Computation metadata
  computedAt:         Date;         // when this aggregate was last recomputed
  goalProfileVersion: number;       // which GoalProfile was active (for audit)
  
  // Source entry IDs (for recomputation audit)
  foodEntryIds:       ObjectId[];   // non-deleted FoodEntries included
}
```

**Unique constraint:** `(userId, date)` — one DayAggregate per user per day.

**Recomputation trigger cascade:**
```
FoodEntry created (mealDate = D)      → recompute DayAggregate(D)
FoodEntry soft-deleted (mealDate = D) → recompute DayAggregate(D)
TrainingSession created (date = D)    → recompute DayAggregate(D)
TrainingSession soft-deleted (date=D) → recompute DayAggregate(D)
GoalProfile version changes           → recompute DayAggregate(today only)
                                        historical DayAggregates not retroactively updated
                                        because proteinTargetG is a snapshot

After DayAggregate(D) is recomputed:
  → If D is in the last 14 days: trigger SignalState recompute
  → Check BaselineSnapshot recalibration trigger (every 10 new logged days)
```

**Why DayAggregate is persisted and not computed on demand:**
The intelligence layer queries 7 days of DayAggregates for each SIGNAL computation. Computing from raw FoodEntries on every query would require aggregating potentially hundreds of records. Persisting the aggregate reduces this to a 7-document query. The tradeoff: recomputation on every change, which is fast (one day at a time, not full history).

**Partial-day behavior:**
A DayAggregate for today (`isComplete = false`) includes all entries logged so far. SIGNAL computation uses it as-is — partial day data is valid data. The intelligence layer knows to interpret a partial day carefully (see `hours_remaining_today` in the computation context).

---

### Entity: BaselineSnapshot

**Purpose:** A versioned, immutable snapshot of the user's computed personal caloric baseline at a point in time.

**Ownership:** System-computed. Created by the Tier 2 statistical layer.

**Mutability:** Immutable once created. New calibrations create new snapshots.

**Lifecycle:** Created after 7 logged days (first establishment). Recalibrated every 10 new logged days. Old snapshots are never deleted — they are superseded.

```typescript
interface BaselineSnapshot {
  _id:                ObjectId;
  userId:             ObjectId;
  version:            number;         // 1, 2, 3... increments with each calibration
  
  // Computed value
  baselineKcal:       number;         // the weighted median (integer, rounded)
  
  // Computation metadata
  computedAt:         Date;
  algorithm:          "weighted-median-v1";  // for future algorithm migrations
  loggedDaysUsed:     number;         // how many days went into this computation
  windowStartDate:    string;         // "YYYY-MM-DD" — earliest day in the window
  windowEndDate:      string;         // latest day in the window
  
  // Confidence
  isEstablished:      boolean;        // true when loggedDaysUsed >= 7
  
  // Lifecycle
  isCurrent:          boolean;        // only one per user is current
  supersededAt:       Date | null;    // null = current
  
  // Recalibration context
  triggeredByLoggedDayCount: number;  // which logged day count triggered this
}
```

**Relationships:**
- `SignalState.baselineSnapshotVersion` → BaselineSnapshot.version (snapshot)
- Creates a `RecalibrationEvent` when version > 1

**Recalibration trigger:**
```
loggedDayCount mod 10 == 0 AND loggedDayCount > 0
  → trigger new BaselineSnapshot computation
  → if new baseline differs from previous by > 5%:
      → create RecalibrationEvent
      → trigger SignalState recompute
```

**Why recalibration doesn't reset the baseline to zero:**
The baseline uses the last 30 days of logged data with recency weighting. Each recalibration incorporates new behavior while preserving the historical trend. It is not a reset — it is a refinement.

---

### Entity: PatternWindow

**Purpose:** The ephemeral computational context for a SIGNAL state computation. Derived from DayAggregates. Never persisted independently.

**Ownership:** Computation artifact. Created in-memory by the Tier 2 statistical layer.

**Mutability:** Ephemeral. Recomputed on every SIGNAL computation trigger.

```typescript
interface PatternWindow {
  userId:              string;           // not stored — computation context only
  
  // Window definition
  windowEnd:           string;           // "YYYY-MM-DD" (today)
  windowStart:         string;           // 7 days before windowEnd
  daysInWindow:        number;           // 7
  
  // Raw data from DayAggregates
  days:                Array<{
    date:              string;
    calories:          number;
    proteinG:          number;
    proteinAdherencePct: number;
    trainingLogged:    boolean;
    totalVolumeKg:     number | null;
  }>;
  
  // Tier 2 computed statistics
  daysLogged:          number;
  avgCalories7d:       number | null;
  avgProtein5d:        number | null;
  proteinAdherence5d:  number | null;
  
  cv7d:                number | null;    // coefficient of variation
  patternSlope:        number | null;    // kcal/day linear regression
  patternQualifier:    "consistent" | "building" | "irregular" | null;
  
  // Baseline context
  baselineKcal:        number | null;
  deltaPercent:        number | null;
  
  // Confidence
  confidenceScore:     number;           // 0–100
  
  // Pre-qualification
  readingTriggered:    boolean;
  underfuelledTriggered: boolean;
  candidateStates:     StateLabel[];
  
  // Today context
  hoursRemainingToday: number;
  proteinGapToday:     number | null;
  trainingSessions7d:  number;
}
```

PatternWindow is constructed by the backend before calling Claude. It is logged (for debugging) but not persisted as a queryable entity.

---

### Entity: SignalState

**Purpose:** The persisted, immutable record of what SIGNAL state was computed for a user at a specific point in time. The historical truth of the system's pattern read.

**Ownership:** System-computed. One active record per user at any time.

**Mutability:** Immutable once created. Never edited. Superseded when a new state is computed.

**Lifecycle:** Created when SIGNAL computation runs and produces a result. Superseded when the next computation produces a different result. Old states are never deleted — they are the behavioral history.

```typescript
interface SignalState {
  _id:                    ObjectId;
  userId:                 ObjectId;
  
  // The read
  state:                  StateLabel;
  patternQualifier:       "consistent" | "building" | "irregular" | null;
  stateDays:              number;   // consecutive days in this state at time of computation
  
  // Computation inputs (snapshot — preserves what was known when computed)
  computedAt:             Date;
  baselineSnapshotVersion: number;
  goalProfileVersion:     number;
  windowStartDate:        string;   // "YYYY-MM-DD"
  windowEndDate:          string;
  
  // Tier 2 values (preserved for audit)
  confidenceScore:        number;
  deltaPercent:           number | null;
  avgCalories7d:          number | null;
  proteinAdherence5d:     number | null;
  cv7d:                   number | null;
  
  // AI synthesis
  aiModel:                string;   // "claude-sonnet-4-6"
  aiReasoning:            string;   // internal — not shown to user
  
  // Lifecycle
  isCurrentState:         boolean;  // only one per user
  supersededAt:           Date | null;
  supersededByStateId:    ObjectId | null;
  
  // How the transition was triggered
  triggerType:            "log_entry" | "schedule" | "goal_change" | "recalibration";
}

type StateLabel =
  | "READING" | "UNDERFUELLED" | "PROTEIN-LIMITED"
  | "DRIFTING" | "CUTTING" | "BUILDING" | "OPTIMISING";
```

**Active state query:**
```
db.signal_states.findOne({ userId: X, isCurrentState: true })
```

**State history query:**
```
db.signal_states.find({ userId: X }).sort({ computedAt: -1 })
```

**Why SignalState is immutable:**
If a user deletes a food entry from 3 days ago, their DayAggregate for that day is updated. But the SignalState computed on that day reflected what the system knew at that time — accurate data the user had logged. Retroactively changing it would corrupt the behavioral history. The corrected entry will be reflected in the next SignalState computation going forward.

**State transition behavior:**
A new SignalState is only created when:
1. The computed state differs from the current state, OR
2. The stateDays counter needs to increment (daily recompute confirms same state)

For case 2: The same state persists — `stateDays` increments — but the implementation creates a new SignalState record. This maintains immutability while advancing the day count.

Alternative: the `stateDays` field updates in-place on the current state. This violates strict immutability but reduces record volume. **Decision: update `stateDays` in-place on the current state for same-state continuations.** New records created only on state label transitions.

---

### Entity: Insight

**Purpose:** The persisted record of an AI-generated instruction line (or explicit null/silence) for a specific computation event.

**Ownership:** System-generated. Append-only.

**Mutability:** Immutable once created.

**Lifecycle:** Created each time a SIGNAL computation runs. One per computation event. May be null (system was silent).

```typescript
interface Insight {
  _id:                ObjectId;
  userId:             ObjectId;
  
  // What was said (or not)
  text:               string | null;  // null = system was silent
  priority:           number;         // 1–7 (from insight hierarchy)
                                      // 7 = silence (null text)
  
  // Context
  generatedAt:        Date;
  generatedForDate:   string;         // "YYYY-MM-DD" — which day this applies to
  signalStateId:      ObjectId;       // the SignalState that triggered this
  
  // AI metadata
  aiModel:            string;
  
  // Display tracking
  shownAt:            Date | null;    // when frontend displayed this to the user
  
  // Suppression
  isSuppressed:       boolean;        // true if staleness check suppressed display
  suppressedReason:   "stale" | "same_as_yesterday" | "confidence_too_low" | null;
}
```

**Why null insights are persisted:**
A persisted null insight is the record that the system checked and chose silence. This enables:
1. Debugging: "why didn't the system say anything on day X?"
2. Staleness detection: "was the same insight shown yesterday?"
3. Analytics: what % of days produce an insight (expected 30–40%)

**Staleness check:**
Before displaying an Insight:
```
yesterday_insight = db.insights.findOne({
  userId: X,
  generatedForDate: yesterday,
  isSuppressed: false
})

if yesterday_insight.text == today_insight.text
   AND protein_gap_changed < 5g:
   → suppress today's insight, create Insight with isSuppressed=true
```

---

### Entity: RecalibrationEvent

**Purpose:** Audit record of a baseline recalibration — when the system's reference point shifted and why.

**Ownership:** System-generated. Append-only. Never deleted.

**Mutability:** Immutable.

```typescript
interface RecalibrationEvent {
  _id:                     ObjectId;
  userId:                  ObjectId;
  occurredAt:              Date;
  
  previousBaselineVersion: number;
  newBaselineVersion:      number;
  previousBaselineKcal:    number;
  newBaselineKcal:         number;
  changePercent:           number;      // signed: positive = baseline rose
  
  triggeredByLoggedCount:  number;      // which logged-day count triggered this
  loggedDaysUsed:          number;      // days in the computation window
  
  isSignificant:           boolean;     // |changePercent| > 5%
}
```

**Display behavior:**
When `isSignificant = true`: surface in compact SIGNAL strip once:
```
"Baseline recalibrated  ·  Reference point shifted +3%"
```
Fades after 8 seconds. Marks the event as `surfacedAt`.

---

### Entity: RecoveryState (v2.0 — future)

**Purpose:** Wearable-sourced recovery data for AI context enrichment. Not in v1.1.

**Defined here to ensure data model compatibility when introduced.**

```typescript
interface RecoveryState {
  _id:               ObjectId;
  userId:            ObjectId;
  date:              string;        // "YYYY-MM-DD"
  
  hrv:               number | null;  // ms
  sleepDurationMin:  number | null;
  sleepQualityScore: number | null;  // 0–100 (source-dependent normalization)
  restingHrBpm:      number | null;
  
  source:            "healthkit" | "oura" | "garmin";
  importedAt:        Date;
}
```

**When introduced:** RecoveryState data will be included in the PatternWindow as an additional context field. It will never directly determine SignalState — it will be one factor among several.

---

## 3. Relationship Model

```
User
 ├── GoalProfile[] (versioned, one current)
 ├── FoodEntry[] (raw events, mealDate-keyed)
 ├── TrainingSession[] (raw events, sessionDate-keyed)
 ├── DayAggregate[] (computed, unique per date)
 ├── BaselineSnapshot[] (versioned, one current)
 ├── SignalState[] (one current, history preserved)
 ├── Insight[] (append-only)
 ├── RecalibrationEvent[] (append-only)
 └── RecoveryState[] (future, date-keyed)
```

```
DayAggregate(date D)
 ├── built from: FoodEntry[mealDate=D, isDeleted=false]
 ├── built from: TrainingSession[sessionDate=D, isDeleted=false]
 └── snapshots:  GoalProfile.proteinTargetG (active at date D)

BaselineSnapshot(version N)
 └── built from: DayAggregate[last 30 logged days]

SignalState
 ├── built from: PatternWindow
 │    └── built from: DayAggregate[last 7 days]
 ├── references: BaselineSnapshot.version (snapshot)
 └── references: GoalProfile.version (snapshot)

Insight
 └── belongs to: SignalState
```

---

## 4. Computation Trigger Graph

```
User logs FoodEntry (mealDate = D)
  ↓
DayAggregate(D).recompute()
  ↓
  ├── If D in last 14 days:
  │     SignalState.recompute()
  │       ↓
  │       BaselineSnapshot.current → PatternWindow.build()
  │         ↓
  │         Tier1.check() → Tier2.compute() → Tier3.synthesize()
  │           ↓
  │           SignalState.create_or_update()
  │           Insight.create()
  │
  └── If loggedDayCount mod 10 == 0:
        BaselineSnapshot.new_version()
          ↓
          RecalibrationEvent.create()
          SignalState.recompute()


User creates new GoalProfile
  ↓
SignalState.reset_to_reading(3_qualifying_days)
DayAggregate(today).recompute()   // update today's proteinTargetG snapshot
// Historical DayAggregates not recomputed


BaselineSnapshot.new_version()
  ↓
RecalibrationEvent.create()
SignalState.recompute()


FoodEntry soft-deleted (mealDate = D)
  ↓
DayAggregate(D).recompute()
  ↓
  Same cascade as FoodEntry created
  (Historical SignalStates NOT retroactively updated)
```

---

## 5. Mutability Taxonomy

| Entity | Create | Update | Delete | Notes |
|---|---|---|---|---|
| User | At login | `name`, `picture`, `timezone` only | No | Core identity fields immutable |
| GoalProfile | At onboarding + goal change | Never | No | New version = new record |
| FoodEntry | At log | Never | Soft-delete only | rawInput immutable |
| TrainingSession | At log | Never | Soft-delete only | rawInput immutable |
| ExerciseSet | With session | Never | With session | Embedded |
| DayAggregate | When first entry for day | Full recompute | No | Recomputed from source |
| BaselineSnapshot | On calibration | `stateDays` only | No | Otherwise immutable |
| SignalState | On recompute | `stateDays`, `isCurrentState` | No | State label immutable |
| Insight | On recompute | `shownAt`, `isSuppressed` | No | Text immutable |
| RecalibrationEvent | On baseline change | `surfacedAt` | No | Immutable audit record |
| PatternWindow | Ephemeral | N/A | N/A | Not persisted |

**Fields that are absolutely immutable after creation (never updated under any circumstance):**

```
FoodEntry.rawInput
FoodEntry.calories / protein / carbs / fat / fiber
FoodEntry.mealDate
FoodEntry.parsedByModel
TrainingSession.rawInput
TrainingSession.exercises
GoalProfile.goal / proteinTargetG / effectiveFrom
BaselineSnapshot.baselineKcal / algorithm
SignalState.state
SignalState.computedAt
SignalState.aiReasoning
Insight.text
RecalibrationEvent.*  (all fields)
```

---

## 6. Timeline Architecture

Every entity in Nouriq is anchored to a point on the user's timeline. There are two temporal dimensions:

**Event time:** When the user action occurred (`loggedAt`, `computedAt`)

**Behavioral time:** Which day in the user's life the action belongs to (`mealDate`, `sessionDate`, `DayAggregate.date`)

These differ when a user logs food after midnight (the meal belonged to yesterday) or when they log retroactively (logging what they ate on a past day).

### Timezone handling

All behavioral dates are stored as `"YYYY-MM-DD"` strings in the user's declared timezone. When a FoodEntry is created:

```
mealDate = toDateString(loggedAt, user.timezone)
```

This is computed server-side using the user's stored timezone. The client does not send the date — it is derived from `loggedAt` + timezone.

**Why strings, not Date objects for behavioral dates:**
MongoDB Date objects are UTC epoch-based. Storing "2026-05-06" as a Date without timezone context will produce incorrect results for users in timezones other than UTC. Storing as a `"YYYY-MM-DD"` string makes the local date unambiguous.

### The waveform timeline

The 7-day waveform shows the last 7 `DayAggregate.date` values where `date <= today_in_user_timezone`. Not the last 7 calendar days — the last 7 days the user exists in the system, even if some have no entries.

For days with no entries, the DayAggregate does not exist. The waveform renders those bars at zero height.

---

## 7. Historical Snapshot Strategy

The question: **"What did the system believe about this user on May 5th?"** must always be answerable.

### Reconstructing historical state

```typescript
// What was the active baseline on a given date?
function getBaselineAtDate(userId, date) {
  return db.baseline_snapshots.findOne({
    userId,
    $or: [
      { isCurrent: true, computedAt: { $lte: date } },
      { supersededAt: { $gt: date }, computedAt: { $lte: date } }
    ]
  }).sort({ version: -1 });
}

// What was the active GoalProfile on a given date?
function getGoalProfileAtDate(userId, date) {
  return db.goal_profiles.findOne({
    userId,
    effectiveFrom: { $lte: date },
    $or: [{ supersededAt: null }, { supersededAt: { $gt: date } }]
  });
}

// What was the active SignalState on a given date?
function getSignalStateAtDate(userId, date) {
  return db.signal_states.findOne({
    userId,
    computedAt: { $lte: date },
    $or: [{ supersededAt: null }, { supersededAt: { $gt: date } }]
  }).sort({ computedAt: -1 });
}
```

This is the Stripe ledger model: because nothing is retroactively modified, the state at any past point in time can always be reconstructed.

### What historical reconstruction enables

- Weekly SIGNAL report: "You were in OPTIMISING state for 18 of the past 30 days."
- Long-term trend: "Your baseline has risen 8% over 3 months."
- Goal-vs-behavior audit: "When you declared LOSE, you held CUTTING for 6 days before transitioning."

---

## 8. Partial-Day Handling

A `DayAggregate` where `date == today && isComplete == false` is always partial — it only reflects entries logged so far.

**Rules for partial DayAggregates in SIGNAL computation:**

1. Included in the 7-day window
2. Not flagged differently from complete days (the pattern is computed as-is)
3. The computation context includes `hoursRemainingToday` so the AI can interpret partially-logged data appropriately

**The AI instruction line and time of day:**

`hoursRemainingToday < 4`: instruction line is suppressed (too late for most dietary action)
`hoursRemainingToday >= 4`: instruction line can fire if threshold is met

**What partial days don't affect:**

- Baseline computation: only uses `isComplete = true` days (past days). Today is never used in baseline calculation.
- CV and pattern slope computation: uses all logged days including today's partial data

---

## 9. AI Memory Boundaries

The AI has no persistent session state. Every computation call is independent. The "AI's memory" is entirely constructed from the database before each call.

**What the AI receives (per computation):**

```
GoalProfile (current version, relevant fields only)
BaselineSnapshot (current version, baselineKcal)
PatternWindow (pre-computed summary of last 7 DayAggregates)
Current SignalState label (for hysteresis — "what state is currently showing?")
```

**What the AI never receives:**

```
User's name or personal identifying information
Previous AI-generated reasoning or Insights
Other users' data
Raw FoodEntry or TrainingSession records
More than 7 days of DayAggregate data
BaselineSnapshot history (only current version)
```

**Why the AI doesn't receive its own previous outputs:**

This prevents compounding errors. If the AI generated a wrong insight yesterday, feeding it back would reinforce the error. Each computation is a fresh read of the data. The history of what the AI said is recorded in Insight records but is not fed back to the AI.

**Why the AI never receives PII:**

The computation does not require the user's name. Removing PII from the context:
1. Reduces token usage
2. Prevents the AI from generating personalized (but inappropriate) language ("John, you should...")
3. Reduces privacy surface area

---

## 10. MongoDB Collections and Indexes

```
Collection: users
Indexes:
  { googleId: 1 }  unique
  { email: 1 }

Collection: goal_profiles
Indexes:
  { userId: 1, version: -1 }
  { userId: 1, isCurrent: 1 }  // fast lookup for current profile

Collection: food_entries
Indexes:
  { userId: 1, mealDate: 1 }       // primary query: get entries for a day
  { userId: 1, loggedAt: -1 }      // recent entries list
  { userId: 1, isDeleted: 1 }

Collection: training_sessions
Indexes:
  { userId: 1, sessionDate: 1 }
  { userId: 1, loggedAt: -1 }

Collection: day_aggregates
Indexes:
  { userId: 1, date: 1 }  unique  // primary lookup: one per user per day
  { userId: 1, date: -1 }         // for range queries (last N days)
  { userId: 1, isComplete: 1 }    // for baseline computation (complete days only)

Collection: baseline_snapshots
Indexes:
  { userId: 1, isCurrent: 1 }     // fast current baseline lookup
  { userId: 1, version: -1 }      // version history

Collection: signal_states
Indexes:
  { userId: 1, isCurrentState: 1 }  // fast current state lookup
  { userId: 1, computedAt: -1 }     // history queries

Collection: insights
Indexes:
  { userId: 1, generatedAt: -1 }
  { userId: 1, generatedForDate: 1 }
  { signalStateId: 1 }

Collection: recalibration_events
Indexes:
  { userId: 1, occurredAt: -1 }
```

**Mongoose schema notes:**
- `mealDate`, `sessionDate`, `date` are `String` type (not `Date`) — stores "YYYY-MM-DD"
- All `Date` fields are stored as UTC timestamps
- `ObjectId` references are not populated in API responses by default — join when needed

---

## 11. Goal-Change Handling

When a user changes their goal (creates a new GoalProfile):

```
Step 1: Persist new GoalProfile (version N+1, isCurrent=true)
        Set previous GoalProfile.isCurrent = false, supersededAt = now

Step 2: Recompute DayAggregate(today) only
        Use new proteinTargetG for today's adherence
        All historical DayAggregates keep their original proteinTargetG snapshot

Step 3: Reset SIGNAL
        SignalState gets triggerType = "goal_change"
        Forces 3-qualifying-day window before positive state
        (Implemented via confidence penalty: new_goal_penalty = -15 on confidence)
        The state displayed may immediately become READING if data is insufficient
        for the new goal context

Step 4: No baseline reset
        Baseline is behavioral (what they eat), not goal-dependent
        DELTA still computed against same baseline
        The interpretation of DELTA changes (surplus is now desired for BUILD goal)
        but the number itself doesn't change

Step 5: No retroactive SignalState changes
        Historical states remain as recorded
```

**Display during goal-change transition:**

```
READING
Goal updated to BUILD  ·  Recalibrating
```

Subtitle uses "Recalibrating" instead of "Baseline forming" — signals intentional reset, not new account.

---

## 12. Baseline Versioning

Each BaselineSnapshot is a complete, immutable record of the baseline at a point in time.

**Version sequence:**

```
v1: First establishment (7 logged days)
    baselineKcal: 1,840
    loggedDaysUsed: 7
    isEstablished: true

v2: First recalibration (17 logged days)
    baselineKcal: 1,890
    loggedDaysUsed: 17
    isEstablished: true

v3: Second recalibration (27 logged days)
    baselineKcal: 1,910
    loggedDaysUsed: 27
```

**What recalibration does to DELTA:**

If baseline rises from 1,840 to 1,910 (+3.8%):
- A user eating 1,850 kcal was DELTA +0.5% before recalibration
- After recalibration: DELTA -3.1%
- The shift is real: their current intake is now slightly below the updated baseline

**The RecalibrationEvent surface:**

Only when `|changePercent| > 5%` is this surfaced to the user. Minor drifts are silent. The threshold prevents notification fatigue while ensuring the user understands significant baseline shifts.

---

## 13. Insight Persistence Rules

**An Insight is created for every SIGNAL computation event.**

This means: even when the system is silent (text = null), an Insight record exists for that computation. The Insight table is a complete log of the system's voice decisions.

**Insight deduplication:**

Before creating a new non-null Insight, check:
```
prev = db.insights.findOne({ userId, generatedForDate: yesterday, isSuppressed: false })

if prev.text == new_text AND protein_gap_delta < 5:
  → create new Insight with isSuppressed = true, suppressedReason = "same_as_yesterday"
  → do not display
```

**Insight aging:**

An Insight becomes stale after 8 hours. If the app is opened more than 8 hours after an Insight was generated, regenerate before displaying. This prevents showing a "add protein to dinner" insight at 11am the next day.

---

## 14. Sync and Update Rules

**The current state of a user can always be reconstructed by reading:**
```
1. db.users.findOne({ _id: userId })
2. db.goal_profiles.findOne({ userId, isCurrent: true })
3. db.baseline_snapshots.findOne({ userId, isCurrent: true })
4. db.signal_states.findOne({ userId, isCurrentState: true })
5. db.day_aggregates.find({ userId, date: { $gte: last7days } })
6. db.insights.findOne({ userId, generatedAt: { $gte: last8hours } })
```

**What the home screen API response includes:**

A single endpoint (`GET /api/home`) returns:
```typescript
interface HomeState {
  // SIGNAL hero
  state:              StateLabel;
  patternQualifier:   string;
  stateDays:          number;
  deltaPercent:       number | null;
  
  // Waveform
  waveformDays:       Array<{
    date:             string;
    calories:         number;
    isToday:          boolean;
    isAboveBaseline:  boolean;
  }>;
  
  // TODAY zone
  todayCalories:      number;
  todayProteinG:      number;
  proteinTargetG:     number;
  todayTraining:      TrainingSessionSummary | null;
  
  // LOG zone
  todayEntries:       FoodEntrySummary[];
  
  // AI instruction
  aiInstruction:      string | null;
  
  // Metadata
  baselineKcal:       number | null;
  isReadingState:     boolean;
  readingDayCount:    number | null;
}
```

This endpoint assembles the response from the cached entities — it does not trigger SIGNAL recomputation. Recomputation is triggered by write operations, not read operations.

---

## 15. Data Retention Philosophy

**All user data is retained indefinitely by default.**

The user's history is their data. Nutrition logs from 2 years ago have analytical value — they form the long-term baseline and behavioral trend. Purging old data without explicit user request would corrupt long-term analysis.

**Soft deletes are permanent:**
Soft-deleted FoodEntry records are excluded from all computations but preserved in the database for the lifetime of the account. The user deleting an entry is a decision about the day's aggregate — not a request to erase the event from existence.

**Account deletion (future feature):**
When implemented: hard-delete all entities for the user. This is the one case where data is permanently removed. Not implemented in v1.1.

**Export:**
Users can export all their data as JSON. The export includes:
- All FoodEntry records (including soft-deleted, marked as such)
- All TrainingSession records
- All DayAggregate records
- All SignalState history
- All Insight history
- All BaselineSnapshot history
- All RecalibrationEvent records

The export is the complete behavioral record. It is human-readable (FoodEntry.rawInput is what they typed; SignalState.state is what the system computed).

---

## 16. Edge-Case Consistency Rules

### Time-of-day edge cases

```
User logs at 11:59pm local time, entry processed at 12:01am UTC:
  → mealDate = local date at time of loggedAt
  → Use user.timezone to compute mealDate server-side
  → loggedAt is stored in UTC; mealDate is the local date string
  → These two can be on different calendar days — that is correct behavior

User logs what they ate for yesterday (retroactive log):
  → Not supported in v1.1 — mealDate is always derived from loggedAt
  → Future feature: allow user to specify "this was yesterday"
  → For now: retroactive logs count for today's DayAggregate
```

### Deletion edge cases

```
User deletes all entries for a day:
  → DayAggregate(D).entryCount = 0
  → DayAggregate(D).totalCalories = 0
  → isComplete = true if D < today
  → This day is now a zero-entry day (treated as "logged zero calories" not "not logged")
  → SIGNAL computation: a day with zero calories but isComplete=true IS in the window
  → With zero calories: very likely to trigger UNDERFUELLED if enough such days
  
  Note: there is no way to "un-log a day" — once a DayAggregate exists, the day
  is part of the window. Users who delete all entries have logged a zero-calorie day.
  This is the honest representation of their data state.

User soft-deletes a food entry from 8 days ago:
  → DayAggregate(D-8).recompute() — updated
  → SignalState: NOT retroactively changed (D-8 is outside the 7-day window)
  → Baseline recalibration may eventually incorporate the corrected day
  → No immediate visible effect (outside the active window)
```

### Concurrent write edge cases

```
User rapidly logs two entries in sequence:
  → Two FoodEntry records created
  → DayAggregate recompute triggered twice
  → Second recompute should subsume first (idempotent: always recompute from source)
  → Use a debounce on DayAggregate recomputation (wait 2s after last write before recomputing)
  → This prevents double-computation during rapid entry sequences
```

### Timezone change edge cases

```
User changes timezone (e.g., travel):
  → Future entries use new timezone for mealDate calculation
  → Historical entries retain their original mealDate (computed with old timezone)
  → Historical DayAggregates are NOT recomputed
  → There may be a gap or overlap day at the transition
  → Accepted edge case — not corrected automatically
```

### SIGNAL computation during DayAggregate recompute race

```
DayAggregate(today) is being recomputed
AND SignalState computation is triggered simultaneously:
  → Use DayAggregate version BEFORE the current recompute (read-committed semantics)
  → After DayAggregate recompute completes, trigger SignalState recompute
  → This ensures SignalState is never computed from a partially-updated DayAggregate
```

---

## 17. Future-Proofing

### Planned extensions that this architecture accommodates

**Barcode scanning (FoodEntry):**
Add `source: "barcode"` and `barcode: string` to FoodEntry. No other changes needed — the entity structure is the same.

**Meal templates (FoodEntry batch):**
Create multiple FoodEntries from one template. Template is a separate entity that points to a set of FoodEntry "prototypes." No changes to core FoodEntry.

**Wearable integration (RecoveryState):**
RecoveryState entity is already defined. Adding it to PatternWindow is a Tier 2 computation change — no entity model changes.

**Social/coach view:**
Add a `coach_user_id` field to User. Coaches can read (not write) their athlete's GoalProfile, DayAggregate, and SignalState. FoodEntry.rawInput is private by default.

**Multi-goal periods:**
GoalProfile already supports versioning. "I'm cutting for 8 weeks then bulking" is modeled as a future GoalProfile with `effectiveFrom` set in the future. Not implemented but structurally supported.

### Algorithm migration

When the baseline algorithm changes (e.g., "weighted-median-v2" with new weighting scheme):

1. New algorithm is deployed with a new `algorithm` field value
2. All future BaselineSnapshot records use the new algorithm
3. Existing snapshots retain their original algorithm label
4. Historical SignalStates retain their original baselineSnapshotVersion reference
5. No backfill — the transition date is the boundary

The `algorithm` field on BaselineSnapshot exists precisely to make this migration transparent and auditable.

---

*This document is the canonical source of truth for all entity definitions.*
*When MongoDB schemas are created, they must match the TypeScript interfaces defined here.*
*When the intelligence layer is implemented, it must use the entity types defined here.*
*Update this document when: new entity added, field mutability rule changes, relationship model changes.*
