import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { DayAggregate } from '../models/DayAggregate';
import { FoodEntry } from '../models/FoodEntry';
import { SignalState } from '../models/SignalState';
import { User } from '../models/User';

export interface WaveformDay {
  date: string;
  calories: number;
  entryCount: number;
}

export interface FoodEntrySummary {
  _id: string;
  mealDate: string;
  loggedAt: string;
  rawInput: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;
  ironMg: number;
  calciumMg: number;
  vitaminDMcg: number;
  vitaminB12Mcg: number;
  magnesiumMg: number;
  zincMg: number;
  potassiumMg: number;
  sodiumMg: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DayMicros {
  iron: number;
  calcium: number;
  vitaminD: number;
  vitaminB12: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  isEstimated: boolean;
}

export interface HomeScreenPayload {
  today: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    entryCount: number;
    targets: MacroTargets;
    micros: DayMicros;
  };
  signal: {
    state: string;
    subtitle: string | null;
    delta: string | null;
    patternQualifier: string | null;
    aiInstruction: string | null;
    isStale: boolean;
  };
  waveform: WaveformDay[];
  entries: FoodEntrySummary[];
  userId: string;
  onboardingComplete: boolean;
}

const KCAL_PER_KG: Record<string, number> = {
  muscle_gain: 38,
  fat_loss:    28,
  performance: 40,
  maintenance: 33,
};

function computeMacroTargets(goal: string | null, proteinTargetG: number, weightKg: number): MacroTargets {
  const p = proteinTargetG;
  const g = goal ?? 'maintenance';

  let calorieTarget: number;
  if (weightKg > 0) {
    calorieTarget = Math.round((KCAL_PER_KG[g] ?? 33) * weightKg);
  } else {
    // legacy fallback for users without weight set
    const ratio = g === 'muscle_gain' ? 0.30 : g === 'fat_loss' ? 0.35 : 0.28;
    calorieTarget = Math.round(p * 4 / ratio);
  }

  const fatPct     = g === 'fat_loss' ? 0.25 : 0.28;
  const fatTargetG = Math.round(calorieTarget * fatPct / 9);
  const fiberTargetG = g === 'fat_loss' ? 35 : 30;
  const carbsTargetG = Math.max(0, Math.round((calorieTarget - p * 4 - fatTargetG * 9) / 4));

  return { calories: calorieTarget, protein: p, carbs: carbsTargetG, fat: fatTargetG, fiber: fiberTargetG };
}

function formatDelta(pct: number): string {
  if (Math.abs(pct) < 3) return 'Near baseline';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${Math.round(pct)}% ${pct > 0 ? 'above' : 'below'} your baseline`;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
    const userDoc = await User.findById(userId).lean();
    const realToday = new Date().toISOString().split('T')[0];

    // Optional date param — must be YYYY-MM-DD and within the last 7 days
    const dateParam = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : null;
    const viewDate = dateParam ?? realToday;

    // Fetch last 7 days of aggregates for waveform (always anchored to real today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const windowStart = sevenDaysAgo.toISOString().split('T')[0];

    const aggregates = await DayAggregate.find({
      userId,
      date: { $gte: windowStart, $lte: realToday },
    })
      .sort({ date: 1 })
      .lean();

    // Aggregate for the viewed date (may be today or a past day in the window)
    const viewAgg = aggregates.find(a => a.date === viewDate)
      ?? (dateParam ? await DayAggregate.findOne({ userId, date: viewDate }).lean() : null);

    // Entries for the viewed date
    const viewEntries = await FoodEntry.find({
      userId,
      mealDate: viewDate,
      isDeleted: false,
    })
      .sort({ loggedAt: -1 })
      .lean();

    // Fetch current SignalState
    const currentSignal = await SignalState.findOne({ userId, isCurrentState: true }).lean();

    const waveform: WaveformDay[] = aggregates.map(a => ({
      date: a.date,
      calories: a.totalCalories,
      entryCount: a.entryCount,
    }));

    const payload: HomeScreenPayload = {
      today: {
        date: viewDate,
        calories: viewAgg?.totalCalories ?? 0,
        protein:  viewAgg?.totalProteinG  ?? 0,
        carbs:    viewAgg?.totalCarbsG    ?? 0,
        fat:      viewAgg?.totalFatG      ?? 0,
        fiber:    viewAgg?.totalFiberG    ?? 0,
        entryCount: viewAgg?.entryCount   ?? 0,
        targets: computeMacroTargets(userDoc?.goal ?? null, userDoc?.proteinTargetG ?? 160, userDoc?.weightKg ?? 0),
        micros: {
          iron:       viewAgg?.totalIronMg        ?? 0,
          calcium:    viewAgg?.totalCalciumMg     ?? 0,
          vitaminD:   viewAgg?.totalVitaminDMcg   ?? 0,
          vitaminB12: viewAgg?.totalVitaminB12Mcg ?? 0,
          magnesium:  viewAgg?.totalMagnesiumMg   ?? 0,
          zinc:       viewAgg?.totalZincMg        ?? 0,
          potassium:  viewAgg?.totalPotassiumMg   ?? 0,
          sodium:     viewAgg?.totalSodiumMg      ?? 0,
          isEstimated: viewEntries.some(e => e.confidence !== 'recalled' && e.confidence !== 'user_corrected'),
        },
      },
      signal: {
        state: currentSignal?.state ?? 'READING',
        subtitle: null,
        delta: currentSignal?.deltaPercent != null
          ? formatDelta(currentSignal.deltaPercent)
          : null,
        patternQualifier: currentSignal?.patternQualifier ?? null,
        aiInstruction: null,
        isStale: false,
      },
      waveform,
      entries: viewEntries.map(e => ({
        _id: e._id.toString(),
        mealDate: e.mealDate,
        loggedAt: e.loggedAt.toISOString(),
        rawInput: e.rawInput,
        name: e.name,
        calories: e.calories,
        proteinG: e.proteinG,
        carbsG: e.carbsG,
        fatG: e.fatG,
        fiberG: e.fiberG,
        parseNote: e.parseNote,
        ironMg:        e.ironMg        ?? 0,
        calciumMg:     e.calciumMg     ?? 0,
        vitaminDMcg:   e.vitaminDMcg   ?? 0,
        vitaminB12Mcg: e.vitaminB12Mcg ?? 0,
        magnesiumMg:   e.magnesiumMg   ?? 0,
        zincMg:        e.zincMg        ?? 0,
        potassiumMg:   e.potassiumMg   ?? 0,
        sodiumMg:      e.sodiumMg      ?? 0,
      })),
      userId: req.user!.userId,
      onboardingComplete: userDoc?.onboardingComplete ?? false,
    };

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

export default router;
