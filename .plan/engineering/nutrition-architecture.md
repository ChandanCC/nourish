# Nutrition & Intelligence Architecture

**Status:** Active — v1.0
**Last updated:** 2026-05-08

Defines the authoritative architecture for nutrition parsing, storage, confidence classification, and SIGNAL computation. The result of a complete architectural stress test against the proposed "deterministic authoritative systems + AI interpretation" pipeline.

---

## Stress Test Findings

### Finding 1 — The Longitudinal Consistency Problem (CRITICAL)

**Current state:** Gemini parses "2 boiled eggs" → returns 156 kcal. On a different day with a different request context: 149 kcal. Both are "correct" estimates but they are not the same number.

**Impact:** DELTA is computed from a 7-day rolling average. Small per-entry variance (±5-10%) averages out somewhat, but introduces *ghost drift* — SIGNAL movement that reflects AI variability, not user behavior. Over time, a user eating identically every day would see DELTA fluctuate ±3-5% purely from parse variance. This is a trust failure.

**Resolution:** Personal food memory (Phase 5) solves this for repeated meals — which represent the majority of a power user's logs after 2 weeks. Authoritative DB lookup solves it for new foods. Both are needed; personal memory is higher ROI for this user profile.

---

### Finding 2 — The Indian Food Gap (ARCHITECTURAL CONSTRAINT)

**Current state:** The proposal uses USDA FoodData Central as the authoritative nutrition source.

**Reality for the target user (Indian gymgoer):**
- USDA coverage of Indian foods: ~30% (dal, rice, roti have entries; biryani, dal makhani, sabzi — marginal or absent)
- IFCT (Indian Food Composition Tables): authoritative for Indian foods, no public REST API
- Open Food Facts: better coverage for packaged Indian products, incomplete for home cooking
- Mixed dishes (dal makhani = ghee + cream + lentils + spices cooked together): no DB has this as a lookup

**Verdict:** For this user, AI estimation will remain the primary parse path for 50-70% of meals. The architecture must account for this. API-first is the correct *direction* but premature as the *primary path* for MVP.

**Resolution:** Build the fallback hierarchy now (personal memory → authoritative lookup → AI estimate) so the routing exists when authoritative sources are added. Do not hard-block on USDA integration for MVP.

---

### Finding 3 — Replay and Historical Stability

**Proposed risk:** If nutrition values in an authoritative DB update (USDA revises a food value), historical FoodEntry records could diverge from current DB values.

**Verdict:** Non-issue IF values are denormalized at write time. FoodEntry must store the actual macro values, not a live foreign key to a food entity. The `sourceId` field is for audit only — it records which entity was matched, not a live join.

**Rule:** Historical FoodEntry values are immutable once written. Recomputation of SIGNAL from historical entries will always use the stored values, never re-fetch from authoritative sources. This is already how the system works — values are stored on entry creation.

---

### Finding 4 — The Homemade Meal Problem

**Challenge:** "mom's rajma" has no USDA entry, no barcode, no standard recipe. AI will estimate it. Every time this is logged, AI may give slightly different values.

**Resolution:** Personal food memory solves this exactly. After the first parse, "mom's rajma" maps to stored values permanently. The estimate is fixed, consistent, and reused. The user can correct it once if the estimate is wrong — correction propagates to all future uses.

---

### Finding 5 — Confidence Instability Risk

**Risk:** If confidence classification changes on retry (AI returns "high" one call, "medium" another), the SIGNAL computation receives inconsistent metadata.

**Resolution:** Confidence is determined at write time and stored immutably with FoodEntry. It never changes after the fact (unless the user corrects the entry). SIGNAL computation does not currently use confidence — confidence is metadata for future UI and analytics use, not a live input to computation.

---

### Finding 6 — When Should AI Override Authoritative Sources?

**The challenge:** USDA says "egg, hard-boiled, 1 large = 78 kcal". User logs "2 of those really big farm eggs". AI might reasonably estimate 180 kcal (larger portions). The authoritative lookup ignores portion ambiguity.

**Verdict:** AI semantic parsing handles portion disambiguation before the lookup. The pipeline is:
1. AI: "What food? What quantity?" → `{ food: "hard-boiled egg", quantity: 2, unit: "large" }`
2. Lookup: "hard-boiled egg, large" → USDA entry
3. Arithmetic: `78 × 2 = 156 kcal` (deterministic)

AI does NOT override the nutritional values. AI determines what was eaten and how much. The source determines the nutrient density. Quantity × density = result.

This is the correct separation. For MVP (no entity extraction yet), AI does both steps in one call and returns the final computed value — this is acceptable as long as the architecture positions AI as an estimator with confidence, not an authoritative source.

---

### Finding 7 — User Correction Priority

**Rule:** User correction is always the highest authority tier. A user who corrects a meal's macros has better information than any database.

**Implementation:** `confidence: 'user_corrected'` stored on the entry. If the same normalized text is logged again, the corrected values from personal food memory are used (not re-parsed by AI). Correction must propagate to memory.

---

## Validated Architecture (Final)

The architecture is validated. The naive "USDA-first" version is adjusted to reflect the Indian food gap and the MVP stage.

```
User Input (text)
↓
Text Normalization
  → lowercase, trim, collapse whitespace
↓
Personal Food Memory Lookup (MongoDB, per-user)
  → Hit: return stored values [confidence: 'recalled']
  → Miss: continue to AI parse
↓
AI Semantic Parser (Gemini/Claude via provider registry)
  → Returns: { name, calories, protein, carbs, fat, fiber, note, confidence: "high"|"medium"|"low" }
  → Confidence mapped to NutritionConfidence
  [Future: structured entity extraction for authoritative lookup]
↓
[Future] Authoritative Lookup
  → USDA FoodData Central (western foods)
  → Open Food Facts (packaged + some Indian foods)
  → [Commercial] IFCT (Indian foods, when API available)
  → Match score determines whether to use or fall back to AI estimate
↓
Confidence Classification
  → 'recalled'        — personal memory hit (fastest, free, deterministic)
  → 'estimated'       — AI parse, AI expressed high/medium confidence
  → 'low_confidence'  — AI parse, AI expressed low confidence
  → 'matched'         — authoritative DB match (future)
  → 'verified'        — barcode scan or user confirmation (future)
  → 'user_corrected'  — user edited values (overrides all above)
↓
Canonical Storage (FoodEntry)
  → Stores denormalized values + confidence + sourceType + sourceId
  → Values are immutable after write (replay safety)
↓
Personal Memory Update
  → Store new parse result for future recall
↓
SIGNAL Computation (unchanged Tier 1 / 2 / 3)
  → Operates on stored values — confidence is metadata only, not an input weight
```

---

## Fallback Hierarchy

```
1. Personal Food Memory     [fastest, free, deterministic, replay-safe]
2. Authoritative Lookup     [deterministic, but Indian food gap]    (future)
3. AI Estimation            [flexible, slight variability, handles everything]
4. User Correction          [highest authority, overrides all]
```

---

## What AI Is Allowed to Do

- Semantically parse natural language into structured food descriptions
- Estimate nutritional values when no authoritative match exists
- Express confidence in its own estimate
- Synthesize SIGNAL interpretation from pre-computed statistics (Tier 3)
- Generate the instruction line (bounded by validation and prohibited patterns)

## What AI Must Never Do

- Be stored as the authoritative nutritional source without confidence metadata
- Override a user correction
- Mutate Tier 1 or Tier 2 deterministic computations
- Recompute historical entries (values are frozen at write time)
- Modify the SIGNAL state machine's hard rules (READING, UNDERFUELLED)

---

## Authoritative Sources (Status)

| Source | Coverage | API | Status |
|---|---|---|---|
| Personal Food Memory | User's own history | Internal | **Implement now** |
| USDA FoodData Central | US/global foods | Free REST | Defer to v1.5 |
| Open Food Facts | Global + packaged | Free REST | Defer to v1.5 |
| Nutritionix | US branded + barcodes | Paid | Defer to v2.0 (barcode) |
| IFCT | Indian foods | No public API | Defer until API available |
| ExerciseDB | Exercise library | Free REST | Defer to v1.2 (workout tracking) |

---

## Workout Pipeline (Architecture Only — Not Implemented)

When workout tracking is implemented (v1.2):

```
User Input (workout description)
↓
AI semantic parse → { exercise, sets, reps, weight_kg, duration_min }
↓
ExerciseDB lookup → canonical exercise + MET value
↓
Deterministic calorie burn: MET × weight_kg × duration_hours
↓
Confidence classification (MATCHED / ESTIMATED / LOW_CONFIDENCE)
↓
Store in WorkoutEntry with same confidence taxonomy
↓
SIGNAL computation reads trainingLogged + totalVolumeKg (existing fields)
```

AI interprets workout performance and trends. MET-based computation is deterministic. AI never calculates calorie burn.

---

## Replay Determinism Rules

1. Once a FoodEntry is written, its `calories`, `protein`, `carbs`, `fat`, `fiber` values never change.
2. SIGNAL recomputation always reads from stored FoodEntry values, never from authoritative sources.
3. Confidence is stored with the entry but never affects the SIGNAL computation (it is metadata for future UI differentiation only).
4. Personal food memory updates independently — it tracks the latest AI parse but does not retroactively change stored entries.

---

## Implementation Status

| Component | Status |
|---|---|
| FoodEntry confidence fields | **Implement now** |
| Personal Food Memory model | **Implement now** |
| foodMemory service | **Implement now** |
| Updated parse prompt (confidence signal) | **Implement now** |
| USDA lookup integration | Defer to v1.5 |
| Open Food Facts integration | Defer to v1.5 |
| ExerciseDB + MET computation | Defer to v1.2 |
| Image meal parsing (multimodal) | Defer to v2.0 |
