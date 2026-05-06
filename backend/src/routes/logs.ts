import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { NutritionDay, IMicros, ITotals, IEntry } from '../models/NutritionDay';

const router = Router();

// ── helpers ──────────────────────────────────────────────────────────────────
function sumTotals(entries: IEntry[]): ITotals {
  return {
    calories: entries.reduce((s, e) => s + (e.totals?.calories || 0), 0),
    protein:  entries.reduce((s, e) => s + (e.totals?.protein  || 0), 0),
    carbs:    entries.reduce((s, e) => s + (e.totals?.carbs    || 0), 0),
    fat:      entries.reduce((s, e) => s + (e.totals?.fat      || 0), 0),
    fiber:    entries.reduce((s, e) => s + (e.totals?.fiber    || 0), 0),
  };
}

const MICRO_KEYS: (keyof IMicros)[] = [
  'vitaminC','vitaminD','vitaminB12','vitaminA','vitaminE','vitaminK',
  'calcium','iron','magnesium','zinc','potassium','sodium','omega3','folate',
];

function sumMicros(entries: IEntry[]): IMicros {
  const result = {} as IMicros;
  MICRO_KEYS.forEach(k => {
    result[k] = entries.reduce((s, e) => s + (e.micros?.[k] || 0), 0);
  });
  return result;
}

// ── GET /logs?days=15  — fetch history ───────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'x-user-id header required' });

    const days = Math.min(parseInt(req.query.days as string) || 15, 30);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceKey = since.toISOString().split('T')[0];

    const docs = await NutritionDay.find({ userId, dateKey: { $gte: sinceKey } })
      .sort({ dateKey: -1 })
      .limit(days)
      .lean();

    res.json({ data: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// ── GET /logs/:dateKey  — single day ─────────────────────────────────────────
router.get('/:dateKey', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'x-user-id header required' });

    const { dateKey } = req.params;
    const doc = await NutritionDay.findOne({ userId, dateKey }).lean();
    if (!doc) return res.status(404).json({ error: 'No log for this date' });

    res.json({ data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch day' });
  }
});

// ── POST /logs/:dateKey/entries  — add an entry ───────────────────────────────
router.post('/:dateKey/entries', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'x-user-id header required' });

    const { dateKey } = req.params;
    const { rawText, summary, items, totals, micros } = req.body;

    if (!rawText || !totals) {
      return res.status(400).json({ error: 'rawText and totals are required' });
    }

    const entry: IEntry = {
      entryId: uuidv4(),
      rawText,
      summary: summary || '',
      items:   items   || [],
      totals,
      micros:  micros  || {},
      loggedAt: new Date(),
    };

    // Upsert the day document, push entry
    const doc = await NutritionDay.findOneAndUpdate(
      { userId, dateKey },
      { $push: { entries: entry } },
      { new: true, upsert: true }
    );

    if (!doc) throw new Error('Upsert failed');

    // Recalculate aggregated totals/micros
    doc.dailyTotals = sumTotals(doc.entries);
    doc.dailyMicros = sumMicros(doc.entries);
    await doc.save();

    res.status(201).json({ data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add entry' });
  }
});

// ── DELETE /logs/:dateKey/entries/:entryId ────────────────────────────────────
router.delete('/:dateKey/entries/:entryId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'x-user-id header required' });

    const { dateKey, entryId } = req.params;

    const doc = await NutritionDay.findOneAndUpdate(
      { userId, dateKey },
      { $pull: { entries: { entryId } } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ error: 'Day not found' });

    // Recalculate
    doc.dailyTotals = sumTotals(doc.entries);
    doc.dailyMicros = sumMicros(doc.entries);
    await doc.save();

    res.json({ data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// ── DELETE /logs/:dateKey  — wipe a whole day ─────────────────────────────────
router.delete('/:dateKey', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(400).json({ error: 'x-user-id header required' });

    const { dateKey } = req.params;
    await NutritionDay.deleteOne({ userId, dateKey });
    res.json({ message: 'Day deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete day' });
  }
});

export default router;
