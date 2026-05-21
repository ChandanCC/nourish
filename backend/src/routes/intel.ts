import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { FoodEntry } from '../models/FoodEntry';
import { TrainingSession } from '../models/TrainingSession';
import { DayAggregate } from '../models/DayAggregate';
import { SignalState } from '../models/SignalState';
import { BaselineSnapshot } from '../models/BaselineSnapshot';
import { User } from '../models/User';
import { GeneratedIntel } from '../models/GeneratedIntel';
import {
  computeChecksum,
  generateMealIntel,
  generateSessionIntel,
  generateDayIntelFull,
  generateWeekIntel,
  generateMonthIntel,
} from '../services/generateIntel';

const router = Router();

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function weekBounds(weekOf: string): { start: string; end: string } {
  const d = new Date(weekOf);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().split('T')[0],
    end:   sun.toISOString().split('T')[0],
  };
}

const KCAL_PER_KG_INTEL: Record<string, number> = {
  muscle_gain: 38, fat_loss: 28, performance: 40, maintenance: 33,
};

const MICRO_RDA = {
  iron: 18, calcium: 1000, vitaminD: 20, vitaminB12: 2.4,
  magnesium: 400, zinc: 11, potassium: 3500, sodium: 2300,
};

function userCalTarget(goal: string | null | undefined, weightKg: number | null | undefined): number {
  return Math.round((KCAL_PER_KG_INTEL[goal ?? 'maintenance'] ?? 33) * (weightKg ?? 70));
}

function trainingTypeFreq(sessions: { activityType: string }[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const s of sessions) {
    freq[s.activityType] = (freq[s.activityType] ?? 0) + 1;
  }
  return freq;
}

async function getProvider() {
  return (await import('../providers/registry')).getSignalSynthesisProvider();
}

// GET /api/intel/meal/:entryId
router.get('/meal/:entryId', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const entryId = String(req.params['entryId']);

  if (!Types.ObjectId.isValid(entryId)) {
    return res.status(400).json({ error: 'Invalid entryId' });
  }

  const entry = await FoodEntry.findOne({ _id: new Types.ObjectId(entryId), userId, isDeleted: false }).lean();
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  const [dayAgg, user, trainingSessions] = await Promise.all([
    DayAggregate.findOne({ userId, date: entry.mealDate }).lean(),
    User.findById(userId).lean(),
    TrainingSession.find({ userId, date: entry.mealDate, isDeleted: false }).lean(),
  ]);

  const calTarget = userCalTarget(user?.goal, user?.weightKg);
  const trainingKcal = trainingSessions.reduce((s, t) => s + t.caloriesBurnt, 0);

  const inputMetrics = {
    meal_name: entry.name,
    calories: entry.calories,
    protein_g: entry.proteinG,
    carbs_g: entry.carbsG,
    fat_g: entry.fatG,
    goal: user?.goal ?? 'maintenance',
    day_calories_so_far: dayAgg?.totalCalories ?? entry.calories,
    day_calorie_target: calTarget,
    day_protein_so_far: dayAgg?.totalProteinG ?? entry.proteinG,
    day_protein_target: user?.proteinTargetG ?? 160,
    training_today_kcal_burnt: trainingKcal,
    micros: {
      iron_mg: entry.ironMg ?? 0,
      calcium_mg: entry.calciumMg ?? 0,
      vitaminD_mcg: entry.vitaminDMcg ?? 0,
      vitaminB12_mcg: entry.vitaminB12Mcg ?? 0,
      magnesium_mg: entry.magnesiumMg ?? 0,
      zinc_mg: entry.zincMg ?? 0,
      potassium_mg: entry.potassiumMg ?? 0,
      sodium_mg: entry.sodiumMg ?? 0,
    },
  };

  const checksum = computeChecksum(inputMetrics);
  const cached = await GeneratedIntel.findOne({ userId, level: 'meal', refId: entryId }).lean();
  if (cached && cached.dataChecksum === checksum) {
    return res.json({ data: cached, cached: true });
  }

  const provider = await getProvider();
  const modelId = provider?.canonicalId ?? 'unknown';

  const result = await generateMealIntel(inputMetrics, modelId);
  if (!result) return res.status(503).json({ error: 'Intel generation failed' });

  const doc = await GeneratedIntel.findOneAndUpdate(
    { userId, level: 'meal', refId: entryId },
    {
      $set: {
        metrics: inputMetrics,
        narrative: result.narrative,
        instruction: result.instruction,
        projection: null,
        dayRating: null,
        aiModel: modelId,
        generatedAt: new Date(),
        dataChecksum: checksum,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ data: doc, cached: false });
});

// GET /api/intel/session/:sessionId
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const sessionId = String(req.params['sessionId']);

  if (!Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }

  const session = await TrainingSession.findOne({ _id: new Types.ObjectId(sessionId), userId, isDeleted: false }).lean();
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const [dayAgg, user] = await Promise.all([
    DayAggregate.findOne({ userId, date: session.date }).lean(),
    User.findById(userId).lean(),
  ]);

  const calTarget = userCalTarget(user?.goal, user?.weightKg);

  const inputMetrics = {
    activity_type: session.activityType,
    duration_min: session.durationMin,
    calories_burnt: session.caloriesBurnt,
    body_parts: session.bodyParts,
    exercises: session.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.length,
      max_weight_kg: ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.weightKg)) : 0,
      total_volume_kg: ex.sets.reduce((s, set) => s + set.reps * set.weightKg, 0),
    })),
    volume_kg: session.totalVolumeKg > 0 ? session.totalVolumeKg : null,
    distance_km: session.distanceKm ?? null,
    description: session.description ?? null,
    goal: user?.goal ?? 'maintenance',
    day_calories: dayAgg?.totalCalories ?? 0,
    day_calorie_target: calTarget,
    day_protein_g: dayAgg?.totalProteinG ?? 0,
    day_protein_target: user?.proteinTargetG ?? 160,
  };

  const checksum = computeChecksum(inputMetrics);
  const cached = await GeneratedIntel.findOne({ userId, level: 'session', refId: sessionId }).lean();
  if (cached && cached.dataChecksum === checksum) {
    return res.json({ data: cached, cached: true });
  }

  const provider = await getProvider();
  const modelId = provider?.canonicalId ?? 'unknown';

  const result = await generateSessionIntel(inputMetrics, modelId);
  if (!result) return res.status(503).json({ error: 'Intel generation failed' });

  const doc = await GeneratedIntel.findOneAndUpdate(
    { userId, level: 'session', refId: sessionId },
    {
      $set: {
        metrics: inputMetrics,
        narrative: result.narrative,
        instruction: result.instruction,
        projection: null,
        dayRating: null,
        aiModel: modelId,
        generatedAt: new Date(),
        dataChecksum: checksum,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ data: doc, cached: false });
});

function getDayTimeContext(date: string, userTimezone: string): {
  day_complete: boolean;
  day_phase: 'morning' | 'afternoon' | 'evening' | 'night';
  hours_remaining_today: number;
} {
  const now = new Date();
  const todayInTz = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(now);
  const isPastDate = date < todayInTz;

  if (isPastDate) {
    return { day_complete: true, day_phase: 'night', hours_remaining_today: 0 };
  }

  const hourStr = new Intl.DateTimeFormat('en-US', { timeZone: userTimezone, hour: '2-digit', hour12: false }).format(now);
  const hour = parseInt(hourStr, 10);
  const hoursRemaining = Math.max(0, 23 - hour);
  const phase: 'morning' | 'afternoon' | 'evening' | 'night' =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  return { day_complete: false, day_phase: phase, hours_remaining_today: hoursRemaining };
}

// GET /api/intel/daily?date=YYYY-MM-DD
router.get('/daily', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const date = (req.query['date'] as string) ?? new Date().toISOString().split('T')[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const [dayAgg, user, baseline, trainingSessions] = await Promise.all([
    DayAggregate.findOne({ userId, date }).lean(),
    User.findById(userId).lean(),
    BaselineSnapshot.findOne({ userId, isCurrent: true }).lean(),
    TrainingSession.find({ userId, date, isDeleted: false }).lean(),
  ]);

  const calTarget = userCalTarget(user?.goal, user?.weightKg);
  const timeCtx = getDayTimeContext(date, user?.timezone ?? 'UTC');

  const micros = dayAgg ? {
    iron_pct:      Math.round((dayAgg.totalIronMg      / MICRO_RDA.iron)      * 100),
    calcium_pct:   Math.round((dayAgg.totalCalciumMg   / MICRO_RDA.calcium)   * 100),
    vitaminD_pct:  Math.round((dayAgg.totalVitaminDMcg / MICRO_RDA.vitaminD)  * 100),
    vitaminB12_pct:Math.round((dayAgg.totalVitaminB12Mcg / MICRO_RDA.vitaminB12) * 100),
    magnesium_pct: Math.round((dayAgg.totalMagnesiumMg / MICRO_RDA.magnesium) * 100),
    zinc_pct:      Math.round((dayAgg.totalZincMg      / MICRO_RDA.zinc)      * 100),
    potassium_pct: Math.round((dayAgg.totalPotassiumMg / MICRO_RDA.potassium) * 100),
    sodium_pct:    Math.round((dayAgg.totalSodiumMg    / MICRO_RDA.sodium)    * 100),
  } : undefined;

  const inputMetrics = {
    date,
    goal: user?.goal ?? 'maintenance',
    baseline_kcal: baseline?.baselineKcal ?? null,
    calorie_target: calTarget,
    protein_target_g: user?.proteinTargetG ?? 160,
    calories: dayAgg?.totalCalories ?? 0,
    protein_g: dayAgg?.totalProteinG ?? 0,
    carbs_g: dayAgg?.totalCarbsG ?? 0,
    fat_g: dayAgg?.totalFatG ?? 0,
    fiber_g: dayAgg?.totalFiberG ?? 0,
    micros,
    training_sessions: trainingSessions.map(t => ({
      type: t.activityType,
      duration_min: t.durationMin,
      kcal_burnt: t.caloriesBurnt,
      body_parts: t.bodyParts,
      volume_kg: t.totalVolumeKg,
      exercises: t.exercises.map(ex => ex.name),
    })),
    ...timeCtx,
  };

  const checksum = computeChecksum(inputMetrics);
  const cached = await GeneratedIntel.findOne({ userId, level: 'daily', refId: date }).lean();
  if (cached && cached.dataChecksum === checksum) {
    return res.json({ data: cached, cached: true });
  }

  const provider = await getProvider();
  const modelId = provider?.canonicalId ?? 'unknown';

  const result = await generateDayIntelFull(inputMetrics, modelId);
  if (!result) return res.status(503).json({ error: 'Intel generation failed' });

  const doc = await GeneratedIntel.findOneAndUpdate(
    { userId, level: 'daily', refId: date },
    {
      $set: {
        metrics: { ...inputMetrics, whatWentWell: result.whatWentWell, whatToImprove: result.whatToImprove },
        narrative: result.narrative,
        instruction: result.instruction,
        projection: null,
        dayRating: result.dayRating,
        aiModel: modelId,
        generatedAt: new Date(),
        dataChecksum: checksum,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ data: doc, cached: false });
});

// GET /api/intel/weekly?weekOf=YYYY-MM-DD
router.get('/weekly', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const weekOf = (req.query['weekOf'] as string) ?? new Date().toISOString().split('T')[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekOf)) {
    return res.status(400).json({ error: 'Invalid weekOf date' });
  }

  const { start, end } = weekBounds(weekOf);
  const key = weekKey(new Date(weekOf));

  const [dayAggs, signal, user, baseline, trainingSessions] = await Promise.all([
    DayAggregate.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    SignalState.findOne({ userId, isCurrentState: true }).lean(),
    User.findById(userId).lean(),
    BaselineSnapshot.findOne({ userId, isCurrent: true }).lean(),
    TrainingSession.find({ userId, date: { $gte: start, $lte: end }, isDeleted: false }).lean(),
  ]);

  const loggedDays = dayAggs.filter(d => d.entryCount > 0);
  const avgCalories = loggedDays.length > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.totalCalories, 0) / loggedDays.length)
    : 0;
  const avgProteinAdh = loggedDays.length > 0
    ? Math.round((loggedDays.reduce((s, d) => s + d.proteinAdherencePct, 0) / loggedDays.length) * 100)
    : 0;
  const baselineKcal = baseline?.baselineKcal ?? null;
  const avgDeltaPct = baselineKcal && avgCalories
    ? Math.round(((avgCalories - baselineKcal) / baselineKcal) * 100)
    : null;
  const totalTrainingKcal = trainingSessions.reduce((s, t) => s + t.caloriesBurnt, 0);
  const totalVolumeKg = trainingSessions.reduce((s, t) => s + t.totalVolumeKg, 0);

  const inputMetrics = {
    week: key,
    goal: user?.goal ?? 'maintenance',
    baseline_kcal: baselineKcal,
    protein_target_g: user?.proteinTargetG ?? 160,
    signal_state: signal?.state ?? 'READING',
    state_days_count: signal?.stateDays ?? 0,
    avg_delta_pct: avgDeltaPct,
    avg_calories_7d: avgCalories,
    protein_adherence_pct: avgProteinAdh,
    days_logged: loggedDays.length,
    training_sessions_count: trainingSessions.length,
    training_types: trainingTypeFreq(trainingSessions),
    total_training_kcal: totalTrainingKcal,
    total_volume_kg: Math.round(totalVolumeKg),
  };

  const checksum = computeChecksum(inputMetrics);
  const cached = await GeneratedIntel.findOne({ userId, level: 'weekly', refId: key }).lean();
  if (cached && cached.dataChecksum === checksum) {
    return res.json({ data: cached, cached: true });
  }

  const provider = await getProvider();
  const modelId = provider?.canonicalId ?? 'unknown';

  const result = await generateWeekIntel(inputMetrics, modelId);
  if (!result) return res.status(503).json({ error: 'Intel generation failed' });

  const doc = await GeneratedIntel.findOneAndUpdate(
    { userId, level: 'weekly', refId: key },
    {
      $set: {
        metrics: inputMetrics,
        narrative: result.narrative,
        instruction: result.instruction,
        projection: result.projection,
        dayRating: null,
        aiModel: modelId,
        generatedAt: new Date(),
        dataChecksum: checksum,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ data: doc, cached: false });
});

// GET /api/intel/monthly?month=YYYY-MM
router.get('/monthly', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const month = (req.query['month'] as string) ?? new Date().toISOString().slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Invalid month (use YYYY-MM)' });
  }

  const [year, mon] = month.split('-').map(Number);
  const start = `${month}-01`;
  const totalDays = daysInMonth(year, mon);
  const end = `${month}-${String(totalDays).padStart(2, '0')}`;

  const [dayAggs, user, baseline, signal, trainingSessions] = await Promise.all([
    DayAggregate.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    User.findById(userId).lean(),
    BaselineSnapshot.findOne({ userId, isCurrent: true }).lean(),
    SignalState.findOne({ userId, isCurrentState: true }).lean(),
    TrainingSession.find({ userId, date: { $gte: start, $lte: end }, isDeleted: false }).lean(),
  ]);

  const loggedDays = dayAggs.filter(d => d.entryCount > 0);
  const avgCalories = loggedDays.length > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.totalCalories, 0) / loggedDays.length)
    : 0;
  const avgProteinAdh = loggedDays.length > 0
    ? Math.round((loggedDays.reduce((s, d) => s + d.proteinAdherencePct, 0) / loggedDays.length) * 100)
    : 0;
  const baselineKcal = baseline?.baselineKcal ?? null;
  const avgDeltaPct = baselineKcal && avgCalories
    ? Math.round(((avgCalories - baselineKcal) / baselineKcal) * 100)
    : null;
  const totalTrainingKcal = trainingSessions.reduce((s, t) => s + t.caloriesBurnt, 0);
  const dominantState = signal?.state ?? 'READING';
  const stateDist: Record<string, number> = { [dominantState]: loggedDays.length };

  const inputMetrics = {
    month,
    goal: user?.goal ?? 'maintenance',
    baseline_kcal: baselineKcal,
    protein_target_g: user?.proteinTargetG ?? 160,
    avg_calories: avgCalories,
    avg_delta_pct: avgDeltaPct,
    protein_adherence_pct: avgProteinAdh,
    days_logged: loggedDays.length,
    total_days_in_month: totalDays,
    training_sessions_count: trainingSessions.length,
    training_types: trainingTypeFreq(trainingSessions),
    total_training_kcal: totalTrainingKcal,
    dominant_state: dominantState,
    state_distribution: stateDist,
  };

  const checksum = computeChecksum(inputMetrics);
  const cached = await GeneratedIntel.findOne({ userId, level: 'monthly', refId: month }).lean();
  if (cached && cached.dataChecksum === checksum) {
    return res.json({ data: cached, cached: true });
  }

  const provider = await getProvider();
  const modelId = provider?.canonicalId ?? 'unknown';

  const result = await generateMonthIntel(inputMetrics, modelId);
  if (!result) return res.status(503).json({ error: 'Intel generation failed' });

  const doc = await GeneratedIntel.findOneAndUpdate(
    { userId, level: 'monthly', refId: month },
    {
      $set: {
        metrics: inputMetrics,
        narrative: result.narrative,
        instruction: result.instruction,
        projection: result.projection,
        dayRating: null,
        aiModel: modelId,
        generatedAt: new Date(),
        dataChecksum: checksum,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ data: doc, cached: false });
});

import { z } from 'zod';

const chatSchema = z.object({
  level:       z.enum(['meal', 'session', 'daily', 'weekly', 'monthly']),
  contextData: z.record(z.string(), z.unknown()),
  message:     z.string().min(1).max(500),
  history:     z.array(z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string(),
  })).max(20).default([]),
});

// POST /api/intel/chat
router.post('/chat', async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { level, contextData, message, history } = parsed.data;
  const userId = new Types.ObjectId(req.user!.userId);
  const user = await User.findById(userId).lean();
  const calTarget = userCalTarget(user?.goal, user?.weightKg);

  const systemPrompt = `You are an expert sports nutritionist and strength coach with 15 years of clinical experience. You give frank, data-driven answers — complete honesty, no softening.

USER PROFILE:
- Goal: ${user?.goal ?? 'maintenance'}
- Weight: ${user?.weightKg ?? 70}kg
- Calorie target: ${calTarget} kcal/day
- Protein target: ${user?.proteinTargetG ?? 160}g/day

INTEL CONTEXT (${level} level data that was already analysed):
${JSON.stringify(contextData)}

RULES:
- Use exact numbers from the context data — never vague
- No praise language: no "great", "well done", "impressive"
- No hedging: no "try to", "consider", "you might want to"
- No "your body", "listen to your body", "everyone is different"
- No exclamation marks
- Keep replies under 400 characters — targeted answers, not essays
- Only reference foods/data that appear in the context`;

  const provider = await getProvider();
  if (!provider) return res.status(503).json({ error: 'AI provider unavailable' });

  const historyBlock = history.length > 0
    ? history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + '\n\n'
    : '';
  const userMessage = `${historyBlock}User: ${message}\n\nAnswer directly and concisely (under 400 characters):`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const reply = await provider.complete({ systemPrompt, userMessage, maxTokens: 200, signal: controller.signal });
    clearTimeout(timeout);
    if (!reply) return res.status(503).json({ error: 'No reply from AI' });
    return res.json({ reply: reply.trim().slice(0, 600) });
  } catch {
    clearTimeout(timeout);
    return res.status(503).json({ error: 'AI request failed' });
  }
});

export default router;
