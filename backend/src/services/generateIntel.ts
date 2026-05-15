import crypto from 'crypto';
import { getSignalSynthesisProvider } from '../providers/registry';
import { PROHIBITED_PATTERNS } from './intelligence/tier3';
import type { DayRating } from '../models/GeneratedIntel';

const VALID_DAY_RATINGS: DayRating[] = ['STRONG', 'SOLID', 'SHORT', 'WEAK'];

export interface MealIntelResult {
  narrative: string;
  instruction: string | null;
  projection: null;
  dayRating: null;
}

export interface SessionIntelResult {
  narrative: string;
  instruction: string | null;
  projection: null;
  dayRating: null;
}

export interface DayIntelResult {
  narrative: string;
  instruction: string | null;
  projection: null;
  dayRating: DayRating;
}

export interface WeekMonthIntelResult {
  narrative: string;
  instruction: string | null;
  projection: string | null;
  dayRating: null;
}

export type IntelResult = MealIntelResult | SessionIntelResult | DayIntelResult | WeekMonthIntelResult;

export function computeChecksum(data: unknown): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function sanitiseInstruction(text: string | null): string | null {
  if (!text) return null;
  const trimmed = text.trim().slice(0, 350);
  if (PROHIBITED_PATTERNS.some(p => p.test(trimmed))) return null;
  return trimmed;
}

function sanitiseNarrative(text: string | null): string | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (PROHIBITED_PATTERNS.some(p => p.test(trimmed))) return null;
  return trimmed;
}

const SYSTEM_PROMPT_BASE = `You are an expert sports nutritionist and strength coach with 15 years of clinical experience. You give the same frank, data-driven assessment you would give a high-performance client — complete honesty, no softening. You identify exactly what's working and what isn't.

RULES (non-negotiable at all levels):
- Use exact numbers from the data — never vague ("intake was low" → "intake was 1,340 kcal, 340 below target")
- When giving an instruction, name a specific food with quantity and macros: "Add 200g cottage cheese post-training (28g protein, 160 kcal)" not "increase your protein"
- Relate food suggestions to training context when relevant: "you trained legs today — the 89g protein leaves a 71g gap that delays recovery"
- CRITICAL — anti-hallucination: Never name, reference, or suggest removing a specific food or ingredient that does not appear explicitly in the input data. You may only SUGGEST ADDING foods (as improvements). Never say "remove the X" or "cut the Y" unless X or Y is listed in the provided data fields. For reductions, say "reduce overall intake by X kcal" without inventing specific foods.
- No praise language: no "great", "well done", "impressive", "nice", "solid work", "keep it up"
- No hedging: no "try to", "consider", "you might want to", "you should think about", "it may be beneficial"
- No "your body", "listen to your body", "everyone is different", "fuel your workout"
- No exclamation marks
- Return ONLY valid JSON — no markdown fences, no prose outside the JSON object`;

async function callProvider(systemPrompt: string, userMessage: string, maxTokens: number): Promise<string | null> {
  const provider = getSignalSynthesisProvider();
  if (!provider) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const result = await provider.complete({ systemPrompt, userMessage, maxTokens, signal: controller.signal });
    clearTimeout(timeout);
    return result;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ── Meal ─────────────────────────────────────────────────────────────────────

export interface MealInput {
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  goal: string;
  day_calories_so_far: number;
  day_calorie_target: number;
  day_protein_so_far: number;
  day_protein_target: number;
  training_today_kcal_burnt: number;
}

const MEAL_SYSTEM = `${SYSTEM_PROMPT_BASE}

TASK: Review this meal as a sports nutritionist examining a client's food log.

narrative: 1–2 tight sentences. State what this meal contributes to today's targets using exact numbers. Flag clearly if the protein-to-calorie ratio is poor, if it eats heavily into the calorie budget while delivering little protein, or if it helps close a gap. If training happened today, note whether this meal helps cover the recovery demand.

suggestion: Suggest one specific, minimal tweak to the actual meal to make it meaningfully better for the stated goal — a swap, an addition, or a portion change. Name the food, amount, and the macro/calorie impact. Examples:
  - "Add 150g Greek yogurt (15g protein, 90 kcal) on the side — closes half your remaining protein gap"
  - "Swap white rice for 150g lentils: same calories, 9g more protein"
  - "Add 2 boiled eggs (12g protein, 140 kcal) — protein-to-calorie ratio for this meal goes from 12% to 22%"
Null if the meal is already well-optimised for the goal.

Return JSON: { "narrative": string, "suggestion": string | null }`;

export async function generateMealIntel(input: MealInput, modelId: string): Promise<MealIntelResult | null> {
  const raw = await callProvider(MEAL_SYSTEM, JSON.stringify(input), 400);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { narrative?: string; suggestion?: string | null };
    const narrative = sanitiseNarrative(parsed.narrative ?? null);
    if (!narrative) return null;
    return { narrative, instruction: sanitiseInstruction(parsed.suggestion ?? null), projection: null, dayRating: null };
  } catch { return null; }
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface SessionExerciseSummary {
  name: string;
  sets: number;
  max_weight_kg: number;
}

export interface SessionInput {
  activity_type: string;
  duration_min: number;
  calories_burnt: number;
  body_parts: string[];
  exercises: SessionExerciseSummary[];
  volume_kg: number | null;
  distance_km: number | null;
  description: string | null;
  goal: string;
  day_calories: number;
  day_calorie_target: number;
  day_protein_g: number;
  day_protein_target: number;
}

const SESSION_SYSTEM = `${SYSTEM_PROMPT_BASE}

TASK: Review this training session and its nutritional context as a sports nutritionist.
Assess whether the day's nutrition adequately supports the training stimulus — was there enough protein for the muscle groups targeted, were calories sufficient to fuel and recover from the effort?
If it was a heavy gym session (high volume, multiple compound movements) and protein is low, quantify the shortfall and say it directly.
For cardio sessions, assess calorie balance and whether intake compensates for energy expenditure.
Use the exercise data to be specific: "a back + chest session with 4,200kg volume on 89g protein leaves a 71g gap that limits recovery."
Instruction: one specific food fix if nutrition did not support the session — name the food, quantity, macros, and timing. Null if nutrition was adequate.
Return JSON: { "narrative": string, "instruction": string|null }`;

export async function generateSessionIntel(input: SessionInput, _modelId: string): Promise<SessionIntelResult | null> {
  const raw = await callProvider(SESSION_SYSTEM, JSON.stringify(input), 400);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { narrative?: string; instruction?: string | null };
    const narrative = sanitiseNarrative(parsed.narrative ?? null);
    if (!narrative) return null;
    return { narrative, instruction: sanitiseInstruction(parsed.instruction ?? null), projection: null, dayRating: null };
  } catch { return null; }
}

// ── Daily ─────────────────────────────────────────────────────────────────────

export interface DailyTrainingDetail {
  type: string;
  duration_min: number;
  kcal_burnt: number;
  body_parts: string[];
  volume_kg: number;
  exercises: string[];
}

export interface DailyInput {
  date: string;
  goal: string;
  baseline_kcal: number | null;
  calorie_target: number;
  protein_target_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  training_sessions: DailyTrainingDetail[];
  day_complete: boolean;
  day_phase: 'morning' | 'afternoon' | 'evening' | 'night';
  hours_remaining_today: number;
}

const DAILY_SYSTEM = `${SYSTEM_PROMPT_BASE}

TASK: Give a full-day nutrition and training review as a sports nutritionist.

day_rating rules:
- STRONG: protein ≥90% of target, calories within ±10% of target, training adequately fuelled if applicable
- SOLID: mostly on track, one clear gap (protein 75–89% OR calories 15% off) or training logged but slightly underfuelled
- SHORT: meaningful deficit — protein <75% target, OR calories >20% below target, OR heavy training session without adequate protein
- WEAK: multiple significant misses — protein <60%, calories severely off, or trained hard on insufficient nutrition

what_went_well: 1 sentence identifying the strongest part of the day with exact numbers.
what_to_improve: 1 sentence identifying the biggest gap with exact numbers. Be direct.
If training was logged, factor it into the assessment — a hard gym session demands more from the nutrition than a rest day.

CRITICAL — timing of instruction:
- If day_complete is false: the day is still in progress. The instruction MUST tell the user what to do BEFORE the day ends — "at dinner", "in your next meal", "before bed". NEVER say "tomorrow" for an incomplete day. Use the day_phase and hours_remaining_today to calibrate specificity. If it is evening with 4h remaining, suggest something achievable before bed.
- If day_complete is true: the instruction should address the NEXT training day or following day.

instruction: one specific, actionable fix — name a food, amount, macros, and when today (if day not complete) or tomorrow. Null if STRONG.
Return JSON: { "day_rating": "STRONG"|"SOLID"|"SHORT"|"WEAK", "what_went_well": string, "what_to_improve": string, "instruction": string|null }`;

export async function generateDayIntelFull(input: DailyInput, _modelId: string): Promise<(DayIntelResult & { whatWentWell: string; whatToImprove: string }) | null> {
  const raw = await callProvider(DAILY_SYSTEM, JSON.stringify(input), 500);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      day_rating?: string;
      what_went_well?: string;
      what_to_improve?: string;
      instruction?: string | null;
    };
    const dayRating = parsed.day_rating as DayRating;
    if (!VALID_DAY_RATINGS.includes(dayRating)) return null;
    const whatWentWell = sanitiseNarrative(parsed.what_went_well ?? null);
    const whatToImprove = sanitiseNarrative(parsed.what_to_improve ?? null);
    if (!whatWentWell || !whatToImprove) return null;
    return {
      narrative: `${whatWentWell} ${whatToImprove}`,
      whatWentWell,
      whatToImprove,
      instruction: sanitiseInstruction(parsed.instruction ?? null),
      projection: null,
      dayRating,
    };
  } catch { return null; }
}

// ── Weekly ────────────────────────────────────────────────────────────────────

export interface WeeklyInput {
  week: string;
  goal: string;
  baseline_kcal: number | null;
  protein_target_g: number;
  signal_state: string;
  state_days_count: number;
  avg_delta_pct: number | null;
  avg_calories_7d: number | null;
  protein_adherence_pct: number;
  days_logged: number;
  training_sessions_count: number;
  training_types: Record<string, number>;
  total_training_kcal: number;
  total_volume_kg: number;
}

const WEEKLY_SYSTEM = `${SYSTEM_PROMPT_BASE}

TASK: Give a weekly nutrition and training assessment as a sports nutritionist.
Narrative: 2–3 sentences covering (1) caloric pattern vs baseline with exact numbers, (2) protein consistency across the week, (3) how the training load relates to nutritional support — were the ${'{training_sessions_count}'} sessions adequately fuelled? Use exact numbers throughout. Be critical if there are gaps.
Instruction: the single clearest lever — name the specific food and amount if it's a nutrition fix, or the specific training adjustment if it's a training fix. Null only if the week was genuinely on track across all dimensions.
Projection: one direct conditional sentence on trajectory ("At this intake and training rate…"). Null if fewer than 4 days logged.
Return JSON: { "narrative": string, "instruction": string|null, "projection": string|null }`;

export async function generateWeekIntel(input: WeeklyInput, _modelId: string): Promise<WeekMonthIntelResult | null> {
  const raw = await callProvider(WEEKLY_SYSTEM, JSON.stringify(input), 600);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { narrative?: string; instruction?: string | null; projection?: string | null };
    const narrative = sanitiseNarrative(parsed.narrative ?? null);
    if (!narrative) return null;
    return {
      narrative,
      instruction: sanitiseInstruction(parsed.instruction ?? null),
      projection: sanitiseNarrative(parsed.projection ?? null),
      dayRating: null,
    };
  } catch { return null; }
}

// ── Monthly ───────────────────────────────────────────────────────────────────

export interface MonthlyInput {
  month: string;
  goal: string;
  baseline_kcal: number | null;
  protein_target_g: number;
  avg_calories: number;
  avg_delta_pct: number | null;
  protein_adherence_pct: number;
  days_logged: number;
  total_days_in_month: number;
  training_sessions_count: number;
  training_types: Record<string, number>;
  total_training_kcal: number;
  dominant_state: string;
  state_distribution: Record<string, number>;
}

const MONTHLY_SYSTEM = `${SYSTEM_PROMPT_BASE}

TASK: Give a monthly nutrition and training assessment as a sports nutritionist reviewing a client's entire month of data.
Narrative: 2–4 sentences: (1) overall caloric pattern and consistency (logged ${'{days_logged}'} of ${'{total_days_in_month}'} days), (2) protein adherence trend, (3) training frequency and whether nutrition matched the training load, (4) the dominant pattern and whether it's producing the right conditions for the stated goal. Use exact numbers. No softening.
Instruction: the single most important change for next month — specific food, quantity, or training adjustment with numbers. Null only if the month was strong across all dimensions.
Projection: a direct one-sentence assessment of where this pattern leads over 3 months if maintained. Null if fewer than 10 days logged.
Return JSON: { "narrative": string, "instruction": string|null, "projection": string|null }`;

export async function generateMonthIntel(input: MonthlyInput, _modelId: string): Promise<WeekMonthIntelResult | null> {
  const raw = await callProvider(MONTHLY_SYSTEM, JSON.stringify(input), 600);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { narrative?: string; instruction?: string | null; projection?: string | null };
    const narrative = sanitiseNarrative(parsed.narrative ?? null);
    if (!narrative) return null;
    return {
      narrative,
      instruction: sanitiseInstruction(parsed.instruction ?? null),
      projection: sanitiseNarrative(parsed.projection ?? null),
      dayRating: null,
    };
  } catch { return null; }
}

export { computeChecksum as checksum };
