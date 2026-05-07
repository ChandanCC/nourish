# AI Behavior

**Status:** Active — v1.1
**Last updated:** 2026-05-07

Defines how the Anthropic API is used, the exact prompts, and the output contracts the rest of the system depends on.

→ `decisions/005-anthropic-proxy.md` — why all AI calls are server-side
→ `engineering/intelligence-architecture.md` — the complete intelligence model (tri-tier architecture, algorithms, thresholds, silence rules). This file contains the API contracts derived from that architecture.

---

## Model

`claude-sonnet-4-6`

Used for:
1. **Food entry parsing** — extract macros from natural language input
2. **SIGNAL computation** — compute STATE, DELTA context, and AI instruction lines (planned)

---

## 1. Food Entry Parsing

### Endpoint

`POST /api/analyse`

### Input

```json
{
  "text": "had a chicken breast with rice and a protein shake"
}
```

### System Prompt (server-side, not exposed to client)

```
You are a precise nutrition parser. The user will describe what they ate.

Extract:
- A clean, readable name for the entry (short, no measurement units in the name)
- Calories (kcal, integer)
- Protein (g, integer)
- Carbohydrates (g, integer)
- Fat (g, integer)
- Fiber (g, integer)

Return ONLY a JSON object. No explanation. No markdown. No prose.

Use standard reference values for foods. If a portion size is not specified, use a standard serving.
If you cannot identify a food item, use your best estimate and flag it.

Format:
{
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "note": "string | null"
}

The "note" field: include only if there is something important about the parse — e.g., "Portion size assumed as 1 medium chicken breast (150g). Adjust if different." Null otherwise.
```

### Output Contract

```typescript
interface AnalyseResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  note: string | null;
}
```

The backend validates this shape before returning it to the frontend. If the model returns malformed JSON or unexpected fields, the backend returns a 422 with `{ error: "Parse failed. Try again." }`.

### Error Handling

```
AI returns malformed JSON      → 422, user sees "Couldn't parse that. Try again."
AI call times out (>10s)       → 504, user sees "Server timeout. Try again."
AI returns empty calories (0)  → Accept, do not block (user may log a water entry)
AI returns negative values     → Clamp to 0
```

---

## 2. SIGNAL Computation (v1.1)

### Architecture Overview

SIGNAL computation uses a tri-tier architecture. The AI (Tier 3) receives a pre-computed summary from deterministic and statistical layers — it never touches raw logs. Safety-critical states (READING, UNDERFUELLED) are hard-rule determined before the AI is consulted.

Full algorithm: `engineering/intelligence-architecture.md`

### Input Contract

The backend computes a `ComputedSummary` before calling Claude. The AI receives only this summary:

```typescript
interface SignalComputationContext {
  computation_type: "state_and_instruction";
  user: {
    goal: "lose" | "build" | "maintain";
    protein_target_g: number;
    baseline_kcal: number;
    baseline_established: boolean;
    account_age_days: number;
    current_state: StateLabel;
    state_days: number;
  };
  window: {
    days_logged: number;
    logged_days: Array<{
      date: string;
      calories: number;
      protein: number;
      training_logged: boolean;
      training_volume_kg?: number;
    }>;
  };
  computed: {
    avg_calories_7d: number;
    avg_protein_5d: number;
    protein_adherence_5d: number;
    delta_percent: number;
    cv_7d: number;
    pattern_slope_kcal_per_day: number;
    pattern_qualifier: "consistent" | "building" | "irregular";
    confidence: number;
    candidate_states: StateLabel[];
    failed_state_reasons: Record<string, string>;
    protein_gap_today: number | null;
    hours_remaining_today: number;
  };
}
```

**The AI is only called if:**
- `reading_triggered = false` (otherwise return READING immediately)
- `underfuelled_triggered = false` (otherwise return UNDERFUELLED immediately)
- `confidence >= 50` (otherwise return READING)
- `candidate_states.length > 0` (otherwise return DRIFTING)

### Output Contract

```typescript
interface SignalResult {
  state: StateLabel;             // must be from candidate_states, or DRIFTING
  pattern: "consistent" | "building" | "irregular";
  ai_instruction: string | null; // max 1 sentence, or null
  reasoning: string;             // internal only — for debugging/logging, never shown
}

type StateLabel =
  | "READING" | "UNDERFUELLED" | "PROTEIN-LIMITED"
  | "DRIFTING" | "CUTTING" | "BUILDING" | "OPTIMISING";
```

The backend validates:
- `state` must be in `candidate_states` OR `DRIFTING` (AI cannot invent states)
- `ai_instruction` max length: 120 characters (enforced — truncated if exceeded)
- `ai_instruction` must not contain any prohibited patterns (checked via regex before storage)

### System Prompt

```
You are Nouriq's nutrition intelligence engine. You receive pre-computed statistics 
about a user's recent logging pattern. Your job is to:

1. Select the most accurate STATE from the candidate_states list
2. Confirm or adjust the pattern qualifier
3. Generate one instruction line (or null)

CRITICAL RULES — read carefully:

STATE SELECTION:
- Choose from candidate_states only. If none fit well, return "DRIFTING".
- Prefer the more conservative state when two candidates are equally plausible.
- A false positive (claiming OPTIMISING when unwarranted) is more damaging 
  than a false negative (staying in DRIFTING one more day).
- READING and UNDERFUELLED are never in candidate_states — those are 
  determined before you are called.

PATTERN QUALIFIER:
- "consistent": intake is stable, low variance (cv < 0.15)
- "building": intake is trending upward (slope > 5 kcal/day)  
- "irregular": high variance or no clear direction
- Use computed.cv_7d and computed.pattern_slope_kcal_per_day to confirm.
  You may adjust from computed.pattern_qualifier if the data clearly supports it.

INSTRUCTION LINE:
Return null if:
  - STATE is OPTIMISING and protein adherence > 0.82
  - STATE is CUTTING and everything is on track
  - There is nothing specific and actionable to say
  - hours_remaining_today < 4
  - The same instruction would apply as yesterday (no change in situation)

Return a specific instruction if:
  - protein_gap_today > 30g AND hours_remaining_today >= 4
  - STATE is PROTEIN-LIMITED (instruction required)
  - User's goal and observed behavior are in clear conflict
  - A pattern-level observation adds genuine value

INSTRUCTION FORMAT RULES:
  - Maximum 1 sentence. Hard limit 120 characters.
  - Reference specific numbers: "48g below target" not "below target"
  - Do not praise: no "great", "good", "well done", "keep it up"
  - Do not hedge: no "might", "consider", "try to", "you could"
  - Do not use "you should" — state the action as a fact
  - Do not reference physiology: no "your body", "metabolism", "recovery"
  - Do not explain what protein is or why it matters
  - The user is an analytical gym professional. Respect their knowledge.

PROHIBITED INSTRUCTION PATTERNS:
  "Great job" / "Nice work" / "Keep it up" / "You're crushing it"
  "Your body needs..." / "Listen to your body"
  "Try to..." / "Consider..." / "You might want to..."
  "Based on your data..." (all instructions are based on data — redundant)
  Any wellness-guru language
  Any exclamation points

VALID INSTRUCTION EXAMPLES:
  "Protein is 48g below target — add a protein source to dinner."
  "Intake averaged 1,340 kcal against a 1,940 kcal baseline this week."
  "3 training days without a log. Record today's session to complete your signal."
  "Intake is 12% above baseline. Your declared goal is LOSE."

Return ONLY valid JSON matching the SignalResult interface.
No markdown. No explanation outside the JSON. No prose.
```

### AI Instruction Rules (Summary)

- Maximum 1 sentence, 120 characters
- References specific numbers or it is not shown
- null when user is on track — silence is the reward
- Prohibited: praise, hedging, wellness language, "you should", exclamation points
- The system observes and states facts. The user decides what to do.

---

## Prompt Versioning

When the system prompt changes:
1. Update this file with the new prompt
2. Note the version change date
3. If the output contract changes, update the TypeScript interface and all consumers

Prompt changes do not require a version bump in the API — the backend handles the prompt.

---

## Rate Limiting (Planned)

To prevent API cost abuse:
- Max 50 `/api/analyse` calls per user per day
- Enforced in the backend middleware layer
- Rate limit state stored in MongoDB (simple counter + TTL index)

Not implemented in v1.0. Add at v1.1.
