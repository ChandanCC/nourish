import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { DayAggregate } from '../models/DayAggregate';
import { FoodEntry } from '../models/FoodEntry';

export interface WaveformDay {
  date: string;
  calories: number;
  entryCount: number;
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
    targets: {
      calories: number | null;
      protein: number;
    };
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
  userId: string;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
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
        targets: {
          calories: null,
          protein:  todayAgg?.proteinTargetG ?? 160,
        },
      },
      signal: {
        state: 'READING',
        subtitle: null,
        delta: null,
        patternQualifier: null,
        aiInstruction: null,
        isStale: false,
      },
      waveform,
      userId: req.user!.userId,
    };

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

export default router;
