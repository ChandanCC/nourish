# Intelligence Architecture

**Status:** Active — v1.1 spec
**Last updated:** 2026-05-07

This document defines the complete computational and behavioral model for Nouriq's AI layer.

→ `engineering/ai-behavior.md` — prompts and API contracts derived from this architecture
→ `product/signal-system.md` — product-facing description of SIGNAL (this doc is the implementation spec)

---

## Governing Principle

**The system computes what it can prove. It infers only when evidence is sufficient. It speaks only when silence would be less useful than the specific thing it has to say.**

The failure mode of AI-powered wellness products is false certainty — claiming insight where there is noise, generating advice where there is ambiguity, performing intelligence rather than exhibiting it. Every rule in this architecture exists to prevent that failure.

---

## 1. Tri-Tier Architecture

The intelligence layer has three tiers. Each tier has a defined role. Higher tiers cannot override lower-tier safety rules.

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 3 — AI Synthesis (Claude)                             │
│  STATE label selection, instruction generation,             │
│  report synthesis, pattern narration                        │
│  ↑ receives pre-computed summaries, not raw logs            │
├─────────────────────────────────────────────────────────────┤
│  TIER 2 — Statistical Layer                                 │
│  Baseline computation, variance analysis,                   │
│  linear regression, confidence scoring,                     │
│  pattern qualification, anomaly detection                   │
│  ↑ operates on clean, validated log data                    │
├─────────────────────────────────────────────────────────────┤
│  TIER 1 — Deterministic Layer                               │
│  Daily totals, macro sums, DELTA math,                      │
│  day counts, percentage calculations,                       │
│  hard-rule safety state checks                              │
│  ↑ operates on raw logged data                              │
└─────────────────────────────────────────────────────────────┘
```

**The hard rule on tier precedence:**

Safety-critical states (`READING`, `UNDERFUELLED`) are determined by Tier 1 rules. If a Tier 1 rule fires, computation stops and the safety state is returned. Tier 2 and Tier 3 are not consulted. The AI cannot override a safety state.

This is not a limitation — it is a design choice. The system's credibility depends on UNDERFUELLED never being wrong. Rule-based precision on safety states earns trust for AI synthesis everywhere else.

---

## 2. What Is Deterministic vs. Inferred

### Tier 1 — Always Deterministic (exact math, no inference)

```
Daily calorie total               sum of logged entries for the day
Daily macro totals                sum of protein/carbs/fat/fiber
Today's running total             same, limited to entries before now
Protein adherence %               (logged_protein / target_protein) × 100
Days logged in window             count of days with ≥ 1 logged entry
7-day average calories            mean of logged days in last 7 (logged days only)
DELTA %                           ((7d_avg - baseline) / baseline) × 100
Waveform bar height               proportional to (day_calories / baseline)
READING trigger                   logged_days_in_last_14 < 3
UNDERFUELLED trigger              avg_calories_last_5_logged < baseline × 0.70
                                  AND logged_days_last_5 ≥ 3
```

### Tier 2 — Statistically Inferred

```
Personal baseline                 weighted median of 30-day logged data
Caloric variance (CV)             σ / mean over logged days in window
Pattern slope                     linear regression over 7-day calorie data
Pattern qualifier                 derived from CV + slope (see §6)
Confidence score                  composite of data completeness + signal clarity
Outlier detection                 2σ threshold for anomalous logged days
Protein trend direction           5-day slope on protein adherence
State candidate set               rule-based pre-screening before AI
```

### Tier 3 — AI Synthesized

```
STATE label (from candidate set)  final selection from pre-screened candidates
AI instruction line               single actionable sentence, or null
SIGNAL transition reasoning       explanation when state changes
Weekly SIGNAL report              narrative synthesis of 7-day pattern
Workout-nutrition observation     correlation statement (observation only)
Anomaly explanation               surface unusual pattern, state possible cause
```

The AI never touches raw log data. It receives a pre-computed summary from Tier 2 — statistical measures, candidate states, computed values. This keeps the AI role as synthesis and judgment, not computation.

---

## 3. Baseline Formation

The personal baseline is the user's behavioral caloric equilibrium — what they actually eat when they are not consciously in a surplus or deficit. It is observed, not calculated.

**Why not TDEE formulas:**
Mifflin-St Jeor and similar equations produce a theoretical maintenance value. Nouriq's baseline is the user's actual logged behavior. For a user who eats 1,800 kcal despite a "calculated" TDEE of 2,200, their baseline is 1,800. DELTA reflects their deviation from their actual pattern, not from a formula.

### Algorithm

```
Input:  all logged days with complete calorie data (not partial entries)
        user's account history

Step 1: Collect eligible days
        - Minimum 7 logged days required before baseline is established
        - Use last 30 calendar days (or all logged days if < 30)
        - Exclude days flagged as anomalous (step 3)

Step 2: Apply recency weighting
        Exponential decay: weight = exp(-λ × days_ago)
        where λ = 0.04 (half-weight at ~17 days)
        More recent behavior reflects current lifestyle more accurately

Step 3: Outlier suppression
        Compute initial unweighted mean and σ
        Flag days where calories > mean + (2 × σ) as positive outliers
        Flag days where calories < mean - (2.5 × σ) as negative outliers
        (asymmetric: large surplus days are more likely to be anomalous occasions
         than large deficit days, which may represent the target)
        Remove flagged days from baseline computation

Step 4: Compute weighted median
        Apply step 2 weights to remaining days
        Weighted median is more robust than weighted mean to skew
        This is the baseline value

Step 5: Confidence
        < 7 logged days:    baseline = null (DELTA shows "—")
        7–14 logged days:   baseline = provisional (labeled in display if ever shown)
        15+ logged days:    baseline = established

Output: { baseline_kcal: number, established: boolean, logged_days_used: number }
```

### Recalibration

Recalibration triggers after every 10 new logged days (not calendar days). On recalibration:

1. Rerun the full algorithm with the updated data window
2. If the new baseline differs from the previous by > 5%: surface the change
3. If the change is ≤ 5%: silent update

**When baseline shifts are surfaced:**

In the compact SIGNAL strip, below the DELTA line, a one-time message appears:

```
Baseline recalibrated  ·  Your reference point shifted +3%
```

9px DM Mono, INK-3. Fades after 8 seconds. Does not persist.

This explains why DELTA may have changed without the user changing behavior. Transparency here prevents the user from thinking the system made an error.

---

## 4. DELTA Calculation

```
DELTA = ((avg_logged_calories_7d - baseline_kcal) / baseline_kcal) × 100
```

**Edge case handling:**

| Condition | Behavior |
|---|---|
| `logged_days_last_7 < 4` | DELTA = null, display "—" |
| `baseline_established = false` | DELTA = null, display "—" |
| `baseline_kcal = 0` | Error — baseline computation failed; surface as READING |
| Result > +50% | Cap display at "+50% or more above baseline" (extreme outlier) |
| Result < −50% | Cap display at "−50% or more below baseline" |

**Display rule:**

DELTA is always displayed as full expression:
- `−14% below your baseline`
- `+8% above your baseline`
- `Near baseline` (when |DELTA| < 3%)

Never: `−14%` alone. The baseline reference is the meaning.

---

## 5. SIGNAL State Taxonomy

### Priority Order (checked top to bottom, first match wins)

```
Priority 1 — READING          (hard rule, Tier 1)
Priority 2 — UNDERFUELLED     (hard rule, Tier 1)
Priority 3 — PROTEIN-LIMITED  (rule-qualified, Tier 2 + AI validation)
Priority 4 — DRIFTING         (rule-qualified, Tier 2)
Priority 5 — CUTTING          (AI synthesis, Tier 2 pre-qualified)
Priority 6 — BUILDING         (AI synthesis, Tier 2 pre-qualified)
Priority 7 — OPTIMISING       (AI synthesis, Tier 2 pre-qualified)
```

Higher priority states always override lower ones. DRIFTING is the default when no positive state criteria are met. OPTIMISING, BUILDING, CUTTING require passing pre-qualification before AI synthesis.

---

### State Definitions (Exact Criteria)

#### READING — Tier 1 Hard Rule

```
Trigger conditions (ANY):
  logged_days_in_last_14 < 3
  baseline_established = false AND account_age_days > 7

Return immediately. No further computation.
No AI synthesis consulted.

Display:
  STATE text:   READING
  Subtitle:     "Day N · Baseline forming" (days 1–3)
                "Day N · Pattern emerging" (days 4–6)
  DELTA:        absent
  AI instruction: absent
```

READING is not a failure state. It is a precise description: the system is reading the user's pattern and does not yet have enough data to say more.

---

#### UNDERFUELLED — Tier 1 Hard Rule

```
Trigger conditions (ALL must be true):
  avg_calories_of_last_5_logged_days < baseline_kcal × 0.70
  logged_days_in_last_5 >= 3
  baseline_established = true

Return immediately. No further computation.
No AI synthesis consulted for state selection.
AI synthesis IS used for: instruction line content only.

Display:
  STATE text:    UNDERFUELLED
  Subtitle:      "Day N of this state · Pattern: [qualifier]"
  AI instruction: Required (not optional). 1 sentence.
                  Must reference the specific gap, not generic advice.
                  Example: "Your intake has averaged 1,240 kcal — 
                  significantly below your baseline of 1,920 kcal."
                  This is an observation, not a prescription.
```

**Why UNDERFUELLED is a hard rule:**

Chronic caloric restriction below 70% of baseline represents a genuine physiological risk (muscle catabolism, hormonal disruption, performance degradation) regardless of declared goal. Even a user attempting an aggressive cut is not intended to eat 70% below their baseline — that is not a deficit, that is inadequate fuelling.

The 70% threshold is deliberately conservative. At 75% below baseline, the state would not trigger. Only severe underfuelling surfaces this state.

---

#### PROTEIN-LIMITED — Tier 2 + AI Validation

```
Pre-qualification (all must be true):
  protein_adherence_last_5_logged < 0.60
    (where adherence = logged_protein / protein_target)
  avg_calories_last_5_logged >= baseline_kcal × 0.80
    (calories are adequate — the issue is specifically protein)
  logged_days_last_5 >= 3
  NOT UNDERFUELLED (checked above)

AI validation (Claude confirms):
  Is protein the binding constraint given this user's goal and pattern?
  AI may return false if the data is ambiguous → fall through to DRIFTING

Display:
  STATE text:    PROTEIN-LIMITED
  Subtitle:      "Day N of this state · Pattern: [qualifier]"
  AI instruction: Required. Specific protein gap + specific suggestion.
                  Example: "Protein averaged 64g against your 150g target.
                  Add a high-protein source to each meal today."
```

The AI validation step exists because PROTEIN-LIMITED is a judgment call. A user who hit 59% protein for 3 days might have just eaten less-protein-heavy food — or they might be systematically misaligned. The AI assesses the pattern, not just the number.

---

#### DRIFTING — Tier 2 Rule

```
Trigger conditions (ANY):
  cv_7d > 0.25 (caloric variance too high for reliable pattern reading)
  logged_days_last_7 < 4 AND logged_days_last_14 >= 3
    (logged enough to be out of READING, but too sparse for pattern)
  no positive state criteria met after checking all states above

Note: DRIFTING is the explicit fallback — it is not a failure to compute.
It is an accurate description of an unclear signal.

Display:
  STATE text:    DRIFTING
  Subtitle:      "Day N of this state · Pattern: irregular"
  AI instruction: Optional. If shown: "Log consistently for 3 days
                  to restore signal." Maximum. Nothing more.
```

DRIFTING does not mean the user is doing poorly. It means the system cannot currently read a clear pattern. This is honest, not negative. A user can be DRIFTING while eating perfectly well — their logging pattern simply isn't dense enough for pattern detection.

---

#### CUTTING — Tier 2 Pre-qualification + AI Synthesis

```
Pre-qualification (all must be true):
  avg_calories_7d < baseline_kcal × 0.93   (≥ 7% deficit)
  protein_adherence_last_5 >= 0.70          (protein protected)
  logged_days_last_7 >= 4                   (sufficient data)
  cv_7d < 0.22                              (consistent enough to be intentional)
  NOT UNDERFUELLED
  NOT PROTEIN-LIMITED

Goal alignment check:
  goal == "lose"     → primary candidate
  goal == "maintain" → secondary candidate (user may be cutting regardless of stated goal)
  goal == "build"    → note the contradiction (AI surfaced in instruction)

AI synthesis:
  Receives: pre-qualification result, full window summary
  Confirms: is the pattern consistent with deliberate cutting?
  May return: null (fall to DRIFTING or OPTIMISING) if confidence insufficient

Display:
  STATE text:    CUTTING
  Subtitle:      "Day N of this state · Pattern: [qualifier]"
  AI instruction: null if protein and deficit are on track
                  "Add protein to protect muscle." if protein adherence 70–75%
```

---

#### BUILDING — Tier 2 Pre-qualification + AI Synthesis

```
Pre-qualification (all must be true):
  avg_calories_7d > baseline_kcal × 1.05   (≥ 5% surplus)
  protein_adherence_last_5 >= 0.70
  logged_days_last_7 >= 5
  training_sessions_last_7 >= 2            (training is occurring)
  pattern_slope_7d > 0                     (trend is upward, not declining surplus)

Goal alignment:
  goal == "build"     → primary candidate
  goal == "maintain"  → note surplus in instruction
  goal == "lose"      → surface goal-behavior contradiction prominently

AI synthesis:
  Confirms: is this a controlled surplus or a chaotic one?
  If CV > 0.18: may prefer DRIFTING over BUILDING (surplus must be consistent)

Display:
  STATE text:    BUILDING
  Subtitle:      "Day N of this state · Pattern: [qualifier]"
  AI instruction: null if on track
                  Training suggestion if training sessions declining
```

---

#### OPTIMISING — Tier 2 Pre-qualification + AI Synthesis

```
Pre-qualification (all must be true):
  logged_days_last_7 >= 4
  protein_adherence_last_5 >= 0.75
  cv_7d < 0.20
  delta_percent within goal-appropriate range:
    goal == "lose":     delta in [-25%, -3%]
    goal == "build":    delta in [+3%, +20%]
    goal == "maintain": delta in [-5%, +5%]

AI synthesis:
  Receives: full pre-qualification summary
  Confirms: is the pattern genuinely aligned with stated goal?
  May adjust: if protein adherence is 75–79%, confirm AI agrees it's sufficient
  Returns: state confirmation + pattern qualifier

Display:
  STATE text:    OPTIMISING
  Subtitle:      "Day N of this state · Pattern: [qualifier]"
  AI instruction: null (on track — silence is the signal)
                  Protein prompt if adherence 75–79% and day not over
```

OPTIMISING is the default "good" state. It does not mean perfect — it means the user's inputs are aligned with their goal. A user can be OPTIMISING at 78% protein adherence if the overall pattern supports their goal.

---

## 6. Pattern Detection Engine

The pattern qualifier (`consistent` / `building` / `irregular`) appears in the STATE subtitle. It is computed from the 7-day window.

```
Input: calorie values for logged days in 7-day window (minimum 4 days)

Step 1: Compute coefficient of variation
  cv = std(calories) / mean(calories)

Step 2: Compute linear regression slope
  slope = linreg(days=[0..6], calories=[c0..c6]).slope
  (in kcal/day)

Step 3: Classify
  IF cv < 0.12:                              → "consistent"
  IF cv < 0.25 AND slope > 5:               → "building"
  IF cv < 0.25 AND slope < -5:              → "consistent" (declining but stable)
  IF cv >= 0.25:                            → "irregular"
  IF cv >= 0.12 AND cv < 0.25 AND abs(slope) <= 5: → "consistent"
```

**What each qualifier communicates to the user:**
- `consistent` — your intake pattern is stable. Predictable. The system has a clear read.
- `building` — intake is gradually increasing. Appropriate for BUILD goal.
- `irregular` — intake varies significantly day to day. Not necessarily bad, but harder to read.

These qualifiers inform the STATE but do not determine it. An OPTIMISING state can be `consistent` or `building`. DRIFTING is always `irregular`.

---

## 7. Confidence System

Confidence is an internal score (0–100). It is **never shown to the user**. It determines whether a computed state is displayed at all.

```
base_score = 50

// Data completeness
+ (logged_days_in_last_7 / 7) × 20          // max +20: full week logged
+ (logged_protein_days_last_5 / 5) × 10     // max +10: protein consistently tracked
+ (baseline_established ? 10 : 0)           // +10: baseline exists
+ (training_data_present ? 5 : 0)           // +5: workout context available

// Signal clarity
- cv_7d × 20                                // max -5 (cv=0.25): high variance penalized
+ (cv_7d < 0.12 ? 10 : 0)                  // +10: very consistent pattern

// Recency
+ (logged_today ? 5 : 0)                    // +5: up-to-date data
- (days_since_last_log × 3)                // -3 per idle day
- (account_age_days < 14 ? 10 : 0)         // -10: new account, conservative

// Clamp
confidence = max(0, min(100, computed_score))
```

**Display thresholds:**

```
confidence >= 75:  Show computed STATE (full confidence)
confidence 60–74:  Show computed STATE with conservative subtitle "Early read"
confidence 50–59:  Show DRIFTING instead (override computed state)
confidence < 50:   Show READING (insufficient signal quality)
```

The conservative bias exists for new accounts (< 14 days) and for sparse-data windows. As the user builds history, confidence naturally rises and the display thresholds become reachable.

---

## 8. Sparse-Data Behavior

The system's behavior degrades gracefully with less data. It never fabricates confidence it doesn't have.

```
Days logged    Behavior
──────────────────────────────────────────────────────────────
0–2            READING, no DELTA, no instruction, no waveform bars
3–4            READING or provisional state (confidence 50–59)
               Waveform shows 3–4 populated bars
               DELTA: absent (baseline not established)
               AI instruction: absent (insufficient data)
5–6            Provisional state possible (confidence 60–74)
               "Early read" subtitle
               DELTA: provisional if baseline window is met
               AI instruction: only if protein gap is clear (> 40g)
7+             Full SIGNAL available (confidence permitting)
               All features available
```

**The sparse-data instruction rule:**

The AI instruction line requires a minimum evidence base before it can make a claim:
- Protein instruction: requires at least 2 days of protein data
- Pattern instruction: requires at least 3 days of calorie data
- Goal-alignment instruction: requires baseline + DELTA computation

Violating these minimums produces instructions that may be wrong (e.g., "your protein is below target" based on one day's data that could be a meal log order-of-operations issue). Wrong early instructions destroy the trust that accurate food parsing just built.

---

## 9. State Transition Rules

### How States Change

State transitions are event-driven, not time-driven. A state changes when a new logged day creates a qualifying pattern, not on a calendar reset.

**Transition triggers:**
1. User logs food/workout entry → system recomputes after each log
2. Midnight recalculation (catches users who logged the previous day's entries late)
3. App open if last computation > 12 hours ago

### Minimum Qualifying Days

Before a state can transition to a positive state (OPTIMISING / BUILDING / CUTTING), the pre-qualification criteria must be met for a minimum window:

```
Upgrading from READING, DRIFTING, UNDERFUELLED → positive state:
  Requires 3 consecutive qualifying logged days

Upgrading from one positive state to another (e.g., OPTIMISING → BUILDING):
  Requires 2 consecutive qualifying logged days
  (already have established pattern — easier to shift direction)

Downgrading from positive to DRIFTING:
  Immediate (one day of qualifying DRIFTING criteria triggers it)

Downgrading to UNDERFUELLED:
  Requires 3 logged days below threshold
  (prevents triggering on one skipped logging day)
```

**Hysteresis on state exits:**

Once in OPTIMISING, the user needs to clearly fail the criteria to exit:
```
Exit OPTIMISING requires:
  cv_7d > 0.28   (higher than entry threshold of 0.20)
  OR protein_adherence_last_3 < 0.62  (lower than entry threshold of 0.75)
  OR delta_percent out of goal range by > 8%

Purpose: prevents flickering at the boundary
```

### Cooling-off Rule

A state cannot change more than once per 24-hour period, except:
- READING trigger (hard rule, immediate)
- UNDERFUELLED trigger (hard rule, immediate)

This prevents the state from appearing to change after every entry logged throughout the day — the user would see their state flicker as partial-day data updates.

Implementation: compute STATE on first app open or background refresh, cache the result for 12 hours. Re-evaluate after midnight or when 12 hours have elapsed.

---

## 10. AI Context Window — Memory Model

The AI receives a carefully constructed context object, not raw logs. This is the full context for STATE computation:

```typescript
interface SignalComputationContext {
  computation_type: "state_and_instruction";
  
  user: {
    goal: "lose" | "build" | "maintain";
    protein_target_g: number;
    baseline_kcal: number;
    baseline_established: boolean;
    account_age_days: number;
    current_state: StateLabel;  // what is currently displayed
    state_days: number;         // consecutive days in current state
  };
  
  window: {
    days_logged: number;        // out of last 7
    logged_days: Array<{
      date: string;             // "YYYY-MM-DD"
      calories: number;
      protein: number;
      training_logged: boolean;
      training_volume_kg?: number;  // if available
    }>;
  };
  
  computed: {
    // Tier 1
    avg_calories_7d: number;
    avg_protein_5d: number;
    protein_adherence_5d: number;  // 0.0–1.0
    delta_percent: number;
    
    // Tier 2
    cv_7d: number;
    pattern_slope_kcal_per_day: number;
    pattern_qualifier: "consistent" | "building" | "irregular";
    confidence: number;
    
    // Pre-qualification
    candidate_states: StateLabel[];  // states that passed rule checks
    failed_states: Array<{ state: StateLabel; reason: string }>;
  };
}
```

**What the AI does with this context:**

1. Review the candidate states (pre-qualified by Tier 2 rules)
2. Select the most accurate state from the candidates
3. Determine the pattern qualifier (confirm or adjust Tier 2's computation)
4. Generate the instruction line (or return null)
5. Return the result

**What the AI must not do:**

- Override a Tier 1 safety state (READING, UNDERFUELLED) — these are not in the candidate_states set when those rules fire
- Compute or modify DELTA — this is provided, not computed by AI
- Speculate about non-logged data ("you might have trained yesterday")
- Reference information not in the context window
- Generate instructions that require data not present (no protein instruction if protein not tracked)

---

## 11. Insight Ranking and Prioritization

The AI instruction line is the system's voice. The hierarchy determines what it says when multiple insights are possible:

```
Priority   Condition                    Instruction
─────────────────────────────────────────────────────────────────────
P1         UNDERFUELLED active          State observation (required)
P2         protein_gap > 40g AND        "Add Xg protein before dinner
           hours_remaining_today > 4    to approach your target."
P3         PROTEIN-LIMITED active       Specific protein guidance
P4         protein_gap 20–40g AND       Lighter protein prompt
           protein_trend == declining
P5         STATE transition occurred    One-line transition context
P6         goal-behavior contradiction  Surface the gap, no judgment
P7         Nothing actionable           null (silence)
```

**The one-instruction rule:**

Only one instruction per computation cycle. If P2 and P5 both apply (protein gap + state transition), show P2. The hierarchy resolves ties. P5 (transition context) is suppressed when a more actionable insight exists.

**Instruction staleness:**

The same instruction is not regenerated if:
- It was shown yesterday and the user's protein is in the same position today
- The user's pattern has not changed since the instruction was last generated
- The instruction would reference numbers that haven't changed meaningfully (< 5g difference)

This prevents the instruction line from being a daily repetition: "Your protein is below target" for the 4th consecutive day becomes noise. The system should notice the pattern level has shifted and either elevate to a pattern instruction or remain silent.

---

## 12. Contradiction Handling

**Goal vs. behavior contradictions:**

When declared goal and observed behavior diverge significantly:

```
Declared: BUILD  |  Observed: consistent deficit > 10%
→ Show: CUTTING (accurate description of behavior)
→ Instruction: "Your intake is in a consistent deficit. Your declared 
   goal is BUILD — the system is monitoring the gap."
   (observation only, no prescription)

Declared: LOSE   |  Observed: consistent surplus > 10%
→ Show: BUILDING (accurate description of behavior)
→ Instruction: "Intake has averaged X% above baseline.
   Your declared goal is LOSE."

Declared: MAINTAIN  |  Observed: OPTIMISING (slight deficit)
→ Show: OPTIMISING (slight deficit within MAINTAIN range is fine)
→ No contradiction surfaced (within tolerance)
```

**The principle:** The system shows what is happening, not what the user intended. The instruction surfaces the gap without judgment.

**Data contradictions (unexpected values):**

```
Logged protein > logged calories / 4:
  Possible (protein has 4 kcal/g — protein calories can't exceed total)
  → Flag as parse anomaly, request re-log
  → Do not use in computation

Single-day caloric spike > 3× baseline:
  Outlier suppressed in baseline computation
  → Show in waveform at capped height
  → Not counted in 7-day average
  → STATE computation excludes the day
  → System is silent about it (no "you ate a lot yesterday" insight)
  
Zero-calorie logged day (everything has 0 calories):
  Treat as not logged (bad parse or placeholder entry)
  → Remove from computation
  → Log count decrements
```

---

## 13. False-Positive Prevention

A false positive is the system claiming a positive state (OPTIMISING, BUILDING, CUTTING) when the user knows their behavior hasn't warranted it. This is the most damaging failure mode — it destroys credibility.

**Structural safeguards:**

1. **Minimum qualifying days:** No positive state from one good day. Three consecutive qualifying days minimum for first entry into a positive state.

2. **Conservative protein threshold:** 75% adherence minimum for OPTIMISING. Most users would agree they should hit 75% to be "on track." The threshold is intuitive and hard to game.

3. **Variance penalty:** High-variance weeks cannot produce OPTIMISING. A week of 1,200 / 2,400 / 1,100 / 2,800 / 1,300 kcal with the right 7-day average would not be called OPTIMISING. The behavior is too unstable to deserve the label.

4. **New account conservatism:** For accounts < 14 days old, all positive state thresholds are tightened by 5% (e.g., protein adherence requires 80% instead of 75%). New users haven't had time to establish genuine patterns.

5. **The DRIFTING default:** When in doubt, DRIFTING is shown. DRIFTING is not a negative state — it is an honest "the signal is unclear." It is never wrong to show DRIFTING when the data is ambiguous.

6. **AI conservative bias instruction:**

The AI synthesis prompt explicitly instructs:

> "When choosing between two candidate states, prefer the more conservative one unless the evidence strongly supports the more positive state. A false positive (claiming OPTIMISING when the pattern doesn't warrant it) is more damaging than a false negative (staying in DRIFTING one day longer than necessary)."

---

## 14. Silence Protocol

The AI instruction line is null more often than it is populated. This is correct behavior.

**The system is silent when:**

```
1. STATE == OPTIMISING AND protein_adherence_today > 0.85
   User is on track. Silence is the signal.

2. STATE == CUTTING AND deficit is within target range AND protein on track
   Everything is working. Don't describe it.

3. hours_remaining_today < 4
   Too late for most actionable food instructions.
   (Exception: UNDERFUELLED always surfaces — time of day doesn't suppress it)

4. The same insight was generated within the last 24 hours
   AND the user's situation hasn't materially changed (< 5g protein shift)
   Repetition destroys signal value.

5. STATE == READING
   Too little data. Do not generate insights from thin data.

6. protein_gap < 20g
   Minor gap. Actionable but not urgent. Silence.

7. Day is fully complete (all meals logged, user has indicated done)
   Nothing to redirect. No point.
```

**Why silence is designed, not default:**

An AI that always generates an instruction line produces a user who stops reading it. The instruction line is valuable precisely because it is absent most of the time. When it appears, the user knows the system has something specific to say. The scarcity creates signal value.

This is the Bloomberg Terminal model: the terminal does not display "everything is normal" — it shows values, and anomalies speak for themselves.

---

## 15. Voice Protocol

The system speaks only when silence would be less useful. When it speaks, the content follows strict rules.

### Structure of a valid instruction

```
[Specific gap] + [Specific action] + [Specific consequence] (optional)

Valid:
  "Protein is 48g below target. Add a protein source to dinner."
  "Intake has averaged 1,340 kcal — 580 kcal below your baseline."
  "3 days without a training log. Log today's session to complete your signal."

Invalid:
  "Try to eat more protein today." (no specific gap, no specific action)
  "Great consistency this week — keep it up!" (praise, not operational)
  "Your body needs fuel to recover." (wellness-guru language, unverifiable)
  "Based on your pattern, you might want to consider..." (hedged non-instruction)
```

### Prohibited language patterns

```
Pattern                         Why prohibited
────────────────────────────────────────────────────────────────────
"Great job" / "Nice work"       Praise. The system does not praise.
"You might want to..."          Hedged. Say what the action is or say nothing.
"Based on your data..."         All instructions are based on data. Redundant.
"Your body..."                  The system does not claim to know physiology.
"Try to..."                     Weak. State the action.
"Consider..."                   Not an instruction.
"This could help you..."        Benefit framing. State facts.
"Remember to..."                Nannying.
"Don't forget..."               Nannying.
"You should..."                 The system observes. The user decides.
Any exclamation point           None, ever.
"Crushing it" / "killing it"    Sports-motivation language.
Any emoji                       Not in this interface.
```

### Voice: system observer, not life coach

The correct mental model for the AI's voice:

> A Bloomberg terminal analyst reading your nutrition data aloud to you. Precise. Data-referenced. Non-evaluative. They state what the numbers show. They do not tell you how to feel about it. They suggest the one clear action if there is one.

---

## 16. Long-Term Adaptation

### 30-day adaptations

- Baseline becomes more accurate (larger data window)
- Weekend vs. weekday patterns become detectable
  (system can note: "Your intake averages 320 kcal higher on weekends")
- Protein target sufficiency can be assessed
  (if user consistently exceeds target, system can suggest revision)

### 90-day adaptations

- 3-month linear regression on calorie trend
  (long-term direction: are they eating progressively more or less?)
- STATE frequency distribution
  (how many days in each STATE over 90 days — weekly report context)
- Goal alignment assessment
  (has declared goal been achievable? Has behavior been consistent with it?)

### Protein target recalibration (90+ days)

If the user's observed protein consistently differs from their target:
- Consistently below target by > 20% for 30+ days: suggest lowering target to achievable level, or acknowledge the gap as a priority
- Consistently above target by > 30% for 30+ days: suggest raising target to reflect actual capability

This is a suggestion surfaced in the weekly SIGNAL report — never forced. The user's declared target is their target until they change it.

---

## 17. Behavioral Trend Detection

The system monitors specific multi-day trends that are more meaningful than single-day readings:

```
Trend                        Window    Signal threshold
────────────────────────────────────────────────────────────────────
Protein decline              5 days    slope < -3g/day for 5 days
Caloric drift upward         7 days    slope > 10 kcal/day for 7 days
Caloric drift downward       7 days    slope < -10 kcal/day for 7 days
Training frequency decline   14 days   sessions_last_7 < sessions_prev_7 × 0.5
Logging consistency decline  7 days    logged_days_last_7 < logged_days_prev_7

Action on trend detection:
  Protein decline:         elevate protein instruction priority
  Caloric drift upward:    surface in weekly report context
  Caloric drift downward:  monitor for UNDERFUELLED approach
  Training decline:        surface in weekly report, not as daily instruction
  Logging decline:         system remains silent (don't nag about not logging)
```

**What trends never cause:**

- Push notifications ("You haven't logged in 2 days!")
- In-app banner notifications
- State changes from trend data alone (state changes require pattern qualification)
- Instructions that reference the trend ("You've been eating less and less this week")

Trends inform the weekly SIGNAL report context. They are not surfaced as daily warnings.

---

## 18. Workout-Nutrition Relationship Modeling

The system can observe correlations between training and nutrition. It reports observations only — never infers causality.

### Observable correlations

```
training_day_avg_calories vs. rest_day_avg_calories
  Requires: ≥ 5 training days logged
  Observation: "Calories average Xkcal lower on training days"
  (no interpretation — the user draws their own conclusion)

protein_on_training_days vs. protein_on_rest_days
  Requires: ≥ 5 training days logged
  Observation: "Protein averages Xg higher on training days"

training_volume_trend vs. caloric_intake_trend
  Requires: ≥ 10 training days with volume data
  Observation: "Training volume has risen 18% over 4 weeks.
  Intake has remained flat."
  (the implication — that more fuel may be needed — is for the user to draw)
```

### BUILDING state training requirement

BUILDING state requires `training_sessions_last_7 >= 2`. This is the one place where training data directly affects SIGNAL computation. The reasoning:

A user eating in a consistent surplus without training is not BUILDING in the Nouriq sense — they are in a caloric surplus with unclear utilization. BUILDING specifically requires that the surplus is being applied to training load. Without training data, OPTIMISING is the appropriate positive state for a user eating appropriately for a bulk goal.

If the user is in a BUILD goal but has 0 training sessions: OPTIMISING (if other criteria met) or DRIFTING (if not). Never BUILDING.

---

## 19. Recovery Correlation Logic

V1.1 has no wearable integration, so recovery data (HRV, sleep) is not available. This section defines the model for when those inputs exist (post-native-app).

**Recovery signals** (when available):
- HRV vs. baseline HRV (from Apple Health)
- Sleep duration and quality (from wearable)
- Resting heart rate trend

**Correlation opportunities:**
- Low HRV + UNDERFUELLED → "Intake and recovery are both suppressed"
- High HRV + OPTIMISING → confirms system read
- Poor sleep streak + DRIFTING intake → possible connection, surfaced in weekly report

**Rules for recovery correlation:**

1. Never claim causality ("your poor sleep is causing undereating")
2. Correlations require ≥ 7 days of both data types
3. Only surface in weekly SIGNAL report, not as daily instruction
4. The user must be able to identify the correlation in their own experience — the system confirms, not reveals

---

## 20. What Makes the AI Feel Trustworthy

Trust in an AI system is built through specific behaviors, not through claiming trustworthiness.

### The five trust behaviors for Nouriq

**1. It is right about food parsing.**
The first interaction a user has with the AI is food parsing. If it correctly identifies "chicken and rice" as approximately 340 kcal, 42g protein, the user's implicit reaction is "this works." Trust is established before the user has any context about how the system works. This is the most important behavior in the product.

**2. It is right about their state.**
When SIGNAL first activates, the user reads their STATE and either nods or rejects. If they nod — if `OPTIMISING` appears during a week they felt in control, or `DRIFTING` appears during a week they know was chaotic — the system has demonstrated that it understands their pattern. This is Trust Layer 3 (from onboarding-system.md). A system that is wrong here has failed at its core value proposition.

**3. It knows when to say nothing.**
A system that always has something to say is not intelligent — it is performative. The absence of the AI instruction line on a good day is itself a signal. The user learns to pay attention when the system speaks precisely because it usually doesn't.

**4. It references specific numbers, not general observations.**
"Your protein averaged 62g below target over the past 5 days" is trustworthy because it is verifiable. The user can check. "Your protein intake needs attention" is not trustworthy because it cannot be verified and might be true of any user at any time.

**5. It acknowledges its own limits.**
READING state is not an empty state — it is an honest statement that the system doesn't have enough data yet. DRIFTING is not a failure state — it is an honest statement that the signal is unclear. A system that says "I don't know yet" is more trustworthy than a system that always has an answer.

### The inverse trust behaviors (must be avoided)

```
Behavior                              Why it destroys trust
──────────────────────────────────────────────────────────────────────
Hallucinated causality                "You're tired so you ate less"
                                      — the system cannot know this

Generic advice                        "Try to eat more vegetables"
                                      — any app says this, all the time

Overclaiming state certainty          OPTIMISING on day 3 of data
                                      — insufficient evidence, feels like flattery

Changing state daily                  DRIFTING → OPTIMISING → DRIFTING
                                      — instability signals unreliability

Praising compliance                   "Great job hitting your protein!"
                                      — the system is an analyst, not a coach

Explaining what the user already      "Protein is important for muscle building"
knows                                 — the target user knows this

Using wellness language               "Listen to your body"
                                      — unverifiable, not operational

Performing intelligence               "Based on my analysis of your complex
                                      nutritional profile..." — no. State the fact.
```

---

## 21. Anomaly Handling

### What counts as an anomaly

```
Single-day caloric spike:     day_calories > rolling_mean × 2.5
Single-day caloric drop:      day_calories < rolling_mean × 0.40
                              (different threshold: very low days may be
                               legitimate restriction, not anomalies)
Parse anomaly:                protein_calories > total_calories
                              (mathematically impossible — bad parse)
Logging gap > 3 days:         not an anomaly, just sparse data
                              (handle as confidence decrease, not as anomaly flag)
```

### How anomalies are handled

**Single-day spikes:**
- Excluded from baseline computation
- Shown in waveform at capped height (to preserve scale)
- Excluded from 7-day average
- System is silent about them (no "you ate a lot on Saturday" instruction)
- Rationale: the user knows. Noting it adds no value. Noting it repeatedly is nannying.

**Repeated spikes (≥ 2 in 7 days):**
- Not excluded from 7-day average (they may be behavioral reality)
- CV increases (variance is real, not noise)
- May trigger DRIFTING if CV exceeds threshold
- The pattern qualifier changes to `irregular`

**Parse anomaly:**
- Return 422 error before saving
- Do not compute SIGNAL with anomalous data
- User sees "Couldn't parse that. Try again."

---

## 22. Edge Case Handling

```
User doesn't log for 7+ days
  → READING state (hard rule)
  → System is silent. No "you haven't logged!" message.
  → When they return and log, computation resumes normally

User changes goal mid-stream
  → STATE resets to READING for 3 logged days
  → Baseline recalibrates to assess new goal alignment
  → DELTA continues to be computed (doesn't reset — the baseline doesn't change)
  → "Goal updated. The system is re-evaluating your pattern."

User has no training history
  → BUILDING state unavailable
  → OPTIMISING, CUTTING, DRIFTING all available
  → The training section shows "TRAINING · Not logged" indefinitely
  → No push to log training

User logs same food every day
  → Pattern is `consistent` (extremely low CV)
  → Baseline very accurately established
  → System functions well — monotonous logging is valid data

User logs partial days (some meals missing)
  → Day is marked as logged
  → Calorie total is lower than actual intake (unlogged meals)
  → System notes this nowhere (no "you may have missed entries")
  → DELTA may be slightly off — this is known and accepted
  → Over time, consistent partial logging still shows baseline accurately

User logs a "cheat day" note ("rest day, ate a lot")
  → Text is parsed as food entry — if not parseable as food, returns error
  → Notes are not a separate data type in v1.1
  → No special handling

Protein target set to 0 (accidentally)
  → Block: protein target < 50g is rejected at input with "This target seems very low."
  → Don't prevent submission — user may have dietary reason — but flag it
  → PROTEIN-LIMITED computation requires target > 0 to function

Baseline jumps significantly after recalibration
  → Surface: "Baseline recalibrated. Your reference point shifted ±X%."
  → DELTA updates to reflect new baseline
  → STATE may change as a result (OPTIMISING → DRIFTING if delta moved)
  → This is expected and correct behavior
```

---

## Appendix: Computational Summary

All values produced by Tier 1 and Tier 2 before AI synthesis:

```typescript
interface ComputedSummary {
  // Tier 1
  logged_days_last_7: number;
  logged_days_last_14: number;
  avg_calories_7d: number | null;
  avg_calories_5d: number | null;
  avg_protein_5d: number | null;
  protein_adherence_5d: number | null;   // 0.0–1.0
  delta_percent: number | null;
  
  // Tier 2
  baseline_kcal: number | null;
  baseline_established: boolean;
  cv_7d: number | null;
  pattern_slope_7d: number | null;       // kcal/day
  pattern_qualifier: "consistent" | "building" | "irregular" | null;
  confidence: number;                    // 0–100
  
  // Pre-qualification results
  reading_triggered: boolean;
  underfuelled_triggered: boolean;
  candidate_states: StateLabel[];
  failed_state_reasons: Record<StateLabel, string>;
  
  // Derived flags
  protein_gap_today: number | null;      // grams below target
  hours_remaining_today: number;
  days_since_last_log: number;
  training_sessions_last_7: number;
}

type StateLabel =
  | "READING"
  | "UNDERFUELLED"
  | "PROTEIN-LIMITED"
  | "DRIFTING"
  | "CUTTING"
  | "BUILDING"
  | "OPTIMISING";
```

---

*This document defines the complete intelligence model.*
*Implementation detail (exact prompts, API contracts): `engineering/ai-behavior.md`*
*Product-facing description: `product/signal-system.md`*
*Update this document when: algorithm changes, thresholds change, new state added, edge case discovered in production.*
