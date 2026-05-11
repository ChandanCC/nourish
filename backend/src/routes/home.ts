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

function computeMacroTargets(goal: string | null, proteinTargetG: number): MacroTargets {
  const p = proteinTargetG;
  let calorieTarget: number;
  let fatTargetG: number;
  let fiberTargetG: number;

  if (goal === 'muscle_gain') {
    calorieTarget = Math.round(p * 4 / 0.30);
    fatTargetG    = Math.round(calorieTarget * 0.28 / 9);
    fiberTargetG  = 30;
  } else if (goal === 'fat_loss') {
    calorieTarget = Math.round(p * 4 / 0.35);
    fatTargetG    = Math.round(calorieTarget * 0.25 / 9);
    fiberTargetG  = 35;
  } else {
    // maintenance / performance / null
    calorieTarget = Math.round(p * 4 / 0.28);
    fatTargetG    = Math.round(calorieTarget * 0.30 / 9);
    fiberTargetG  = 30;
  }

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
    const today = new Date().toISOString().split('T')[0];

    // Fetch last 7 days of aggregates for waveform
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const windowStart = sevenDaysAgo.toISOString().split('T')[0];

    const aggregates = await DayAggregate.find({
      userId,
      date: { $gte: windowStart, $lte: today },
    })
      .sort({ date: 1 })
      .lean();

    const todayAgg = aggregates.find(a => a.date === today);

    // Fetch today's entries for LOG zone (non-deleted, most recent first)
    const todayEntries = await FoodEntry.find({
      userId,
      mealDate: today,
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
        date: today,
        calories: todayAgg?.totalCalories ?? 0,
        protein:  todayAgg?.totalProteinG  ?? 0,
        carbs:    todayAgg?.totalCarbsG    ?? 0,
        fat:      todayAgg?.totalFatG      ?? 0,
        fiber:    todayAgg?.totalFiberG    ?? 0,
        entryCount: todayAgg?.entryCount   ?? 0,
        targets: computeMacroTargets(userDoc?.goal ?? null, userDoc?.proteinTargetG ?? 160),
        micros: {
          iron:       todayAgg?.totalIronMg        ?? 0,
          calcium:    todayAgg?.totalCalciumMg     ?? 0,
          vitaminD:   todayAgg?.totalVitaminDMcg   ?? 0,
          vitaminB12: todayAgg?.totalVitaminB12Mcg ?? 0,
          magnesium:  todayAgg?.totalMagnesiumMg   ?? 0,
          zinc:       todayAgg?.totalZincMg        ?? 0,
          potassium:  todayAgg?.totalPotassiumMg   ?? 0,
          sodium:     todayAgg?.totalSodiumMg      ?? 0,
          isEstimated: todayEntries.some(e => e.confidence !== 'recalled' && e.confidence !== 'user_corrected'),
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
      entries: todayEntries.map(e => ({
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
