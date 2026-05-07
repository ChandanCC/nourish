# Future Idea: Training Integration

**Status:** Deferred — partial in v1.0 (manual log only)
**Last updated:** 2026-05-07

---

## Current State (v1.0)

Training is manually logged via the command bar (`+W` → workout sheet). The system captures:
- Session type (Push / Pull / Legs / etc.)
- Duration
- Exercises logged (name + sets × reps × weight)

Training data feeds into SIGNAL computation as a secondary input (primary: nutrition).

---

## Deferred: Wearable Data Integration

**What:** Pull training data automatically from:
1. Apple Health / HealthKit (workouts, HRV, sleep)
2. Garmin Connect
3. Strava

**Why it matters:**
- Removes the logging friction for training (users currently must log manually)
- HRV + sleep data would make `UNDERFUELLED` detection significantly more accurate
- Heart rate during training sessions would inform caloric expenditure estimates

**Why deferred:**
- HealthKit API requires iOS app (not just a web app) → requires native app build
- OAuth integrations with Garmin/Strava add maintenance overhead
- The core nutrition tracking loop must prove its value before training data complexity is added
- Adding wearable data could shift the product identity from "nutrition intelligence" to "fitness dashboard" — a more crowded and harder positioning

---

## Deferred: Training Progress Tracking

**What:** Track progressive overload over time — flag when a user adds weight/volume on a specific lift.

**Example:**
```
TRAINING  ·  Push  ·  52 min
Volume 14,200 kg  ·  Progressive on 3 lifts
→ Bench up 5kg from last week
```

**Current state:** The `Progressive on N lifts` label exists in the spec but the backend calculation is not yet implemented.

---

## Design Constraints (if wearable integration is built)

- Automatic data must be clearly labeled as automatic vs. manual (user trust)
- Sleep / HRV data must never be displayed raw — only synthesized into SIGNAL context
- No separate "Fitness" or "Recovery" tab — training data feeds SIGNAL, not a new surface
- Apple Watch complications or widget: SIGNAL state only (one line: `OPTIMISING · −8%`)
