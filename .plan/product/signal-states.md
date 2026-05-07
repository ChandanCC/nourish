# SIGNAL State Machine

**Status:** Active — v1.1 spec
**Last updated:** 2026-05-07

Canonical reference for all valid SIGNAL states, their trigger conditions, priority order, transition rules, and display requirements. This is the single source of truth for STATE behavior.

→ See: `product/signal-system.md` for SIGNAL concept overview.
→ See: `engineering/intelligence-architecture.md` for full computation algorithms and thresholds.
→ See: `design-system/components/signal-hero.md` for visual implementation.

---

## State Inventory

| State | Tier | Type | AI used? |
|---|---|---|---|
| `READING` | 1 | Hard rule | No |
| `UNDERFUELLED` | 1 | Hard rule | Instruction only |
| `PROTEIN-LIMITED` | 2+AI | Rule-qualified | Confirmation + instruction |
| `DRIFTING` | 2 | Rule-based | Optional instruction |
| `CUTTING` | 2+AI | Pre-qualified | Full synthesis |
| `BUILDING` | 2+AI | Pre-qualified | Full synthesis |
| `OPTIMISING` | 2+AI | Pre-qualified | Full synthesis |

---

## Priority Order

States are evaluated top-to-bottom. First match wins. Higher-priority states always override lower ones.

```
1. READING          ← checked first, always
2. UNDERFUELLED     ← checked second, always
3. PROTEIN-LIMITED  ← checked third
4. DRIFTING         ← checked fourth / fallback
5. CUTTING          ← checked fifth (AI synthesis if pre-qualified)
6. BUILDING         ← checked sixth (AI synthesis if pre-qualified)
7. OPTIMISING       ← last; also the AI default if no other state qualifies
```

DRIFTING is the explicit fallback — if no positive state criteria are met after checking all states, DRIFTING is returned. It is not a computation failure; it is an accurate description of an unclear signal.

---

## State Definitions

### READING — Tier 1 Hard Rule

**Trigger (ANY):**
- `logged_days_in_last_14 < 3`
- `baseline_established = false` AND `account_age_days > 7`

**Behavior:** Return immediately. No Tier 2 or AI computation.

**Display:**
- STATE: `READING`
- Subtitle (days 1–3): `Day N · Baseline forming`
- Subtitle (days 4–6): `Day N · Pattern emerging`
- DELTA: absent
- AI instruction: absent

---

### UNDERFUELLED — Tier 1 Hard Rule

**Trigger (ALL must be true):**
- `avg_calories_of_last_5_logged_days < baseline_kcal × 0.70`
- `logged_days_in_last_5 >= 3`
- `baseline_established = true`

**Behavior:** Return immediately. AI is consulted for instruction line content only — not for state selection.

**Display:**
- STATE: `UNDERFUELLED`
- Subtitle: `Day N of this state · Pattern: [qualifier]`
- AI instruction: Required. Must reference the specific caloric gap. Observation, not prescription.

---

### PROTEIN-LIMITED — Tier 2 + AI Validation

**Pre-qualification (ALL must be true):**
- `protein_adherence_last_5_logged < 0.60`
- `avg_calories_last_5_logged >= baseline_kcal × 0.80` (calories adequate; protein is the gap)
- `logged_days_last_5 >= 3`
- Not UNDERFUELLED

**AI validation:** Claude confirms protein is the binding constraint given goal and pattern. May return false → fall through to DRIFTING.

**Display:**
- STATE: `PROTEIN-LIMITED`
- Subtitle: `Day N of this state · Pattern: [qualifier]`
- AI instruction: Required. Must cite specific protein gap and specific suggestion.

---

### DRIFTING — Tier 2 Rule

**Trigger (ANY):**
- `cv_7d > 0.25` (caloric variance too high for reliable pattern)
- `logged_days_last_7 < 4` AND `logged_days_last_14 >= 3`
- No positive state criteria met (explicit fallback)

**Display:**
- STATE: `DRIFTING`
- Subtitle: `Day N of this state · Pattern: irregular`
- AI instruction: Optional. If shown: one sentence maximum.

---

### CUTTING — Tier 2 Pre-qualification + AI Synthesis

**Pre-qualification (ALL must be true):**
- `avg_calories_7d < baseline_kcal × 0.93` (≥7% deficit)
- `protein_adherence_last_5 >= 0.70`
- `logged_days_last_7 >= 4`
- `cv_7d < 0.22`
- Not UNDERFUELLED, not PROTEIN-LIMITED

**AI synthesis:** Confirms deliberate cutting pattern. May return null → falls through.

**Display:**
- STATE: `CUTTING`
- Subtitle: `Day N of this state · Pattern: [qualifier]`
- AI instruction: Null if protein and deficit are on target.

---

### BUILDING — Tier 2 Pre-qualification + AI Synthesis

**Pre-qualification (ALL must be true):**
- `avg_calories_7d > baseline_kcal × 1.05` (≥5% surplus)
- `protein_adherence_last_5 >= 0.75`
- `logged_days_last_7 >= 4`
- `cv_7d < 0.22`
- Not UNDERFUELLED, not PROTEIN-LIMITED

**AI synthesis:** Confirms deliberate building pattern. May return null → falls through.

**Display:**
- STATE: `BUILDING`
- Subtitle: `Day N of this state · Pattern: [qualifier]`
- AI instruction: Null if surplus and protein are on target.

---

### OPTIMISING — Tier 2 Pre-qualification + AI Synthesis

**Pre-qualification (ALL must be true):**
- Caloric intake within ±7% of baseline
- `protein_adherence_last_5 >= 0.80`
- `logged_days_last_7 >= 4`
- `cv_7d < 0.18` (most consistent of the states)

**AI synthesis:** Confirms maintenance/optimisation pattern. If insufficient confidence, falls through to DRIFTING. OPTIMISING is the only state AI can default to if pre-qualified and no better state is found.

**Display:**
- STATE: `OPTIMISING`
- Subtitle: `Day N of this state · Pattern: [qualifier]`
- AI instruction: Null in most cases. May surface a micro-optimisation if confidence is high.

---

## Transition Rules

### Minimum Duration Before Transition

A state is not applied until the pattern has been observed for the required confirmation window. This makes SIGNAL resistant to noise.

| State | Minimum days before applying |
|---|---|
| READING | Immediate (data-gated, not time-gated) |
| UNDERFUELLED | 3 logged days meeting criteria |
| PROTEIN-LIMITED | 3 logged days meeting criteria |
| DRIFTING | 1 day (fallback — applies when no other state qualifies) |
| CUTTING | 4 logged days meeting criteria |
| BUILDING | 4 logged days meeting criteria |
| OPTIMISING | 4 logged days meeting criteria |

### Transition Display

When STATE changes:
1. Old STATE fades out at 80ms.
2. New STATE fades in at 160ms.
3. One-line confirmation at INK-2 holds 3 seconds then fades: `State updated · Pattern detected over N days.`

No color wash. No celebration. No notification.

### Transition Back to READING

READING is re-triggered if `logged_days_in_last_14` drops below 3 (e.g., extended logging gap). This is honest, not punitive. The system acknowledges it has lost signal.

---

## Pattern Qualifier

Each non-READING state carries a pattern qualifier in its subtitle.

| Qualifier | Condition |
|---|---|
| `consistent` | `cv_7d < 0.12` (low variance, steady pattern) |
| `building` | `pattern_slope > 0` AND `cv_7d < 0.20` (rising trend, not chaotic) |
| `irregular` | `cv_7d >= 0.20` OR DRIFTING state |

DRIFTING always uses `irregular`. It is not computed — it is the definition of the state.

---

## AI Output Contract

For states requiring AI synthesis, the output shape is:

```typescript
{
  state: SignalStateValue,        // must be in candidate_states
  pattern_qualifier: 'consistent' | 'building' | 'irregular',
  ai_instruction: string | null,  // max 120 chars if present
  reasoning: string               // internal only, never displayed
}
```

**Validation (backend, before storing):**
- `state` must be in `candidate_states` from Tier 2 pre-qualification
- `ai_instruction` length ≤ 120 characters if not null
- No prohibited language patterns (see `engineering/ai-behavior.md`)

If validation fails: deterministic fallback to top candidate from Tier 2.

---

*Update this file when state definitions, thresholds, or transition rules change.*
*All threshold changes require a DECISION_LOG entry and a decisions/ ADR.*
