import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { FoodEntry } from '../models/FoodEntry';
import { computeDayAggregate } from '../services/computeDayAggregate';

const router = Router();

// GET /api/logs?date=YYYY-MM-DD  — entries for a day (today if omitted)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
    const date = (req.query.date as string) ?? new Date().toISOString().split('T')[0];

    const entries = await FoodEntry.find({ userId, mealDate: date, isDeleted: false })
      .sort({ loggedAt: -1 })
      .lean();

    res.json({ data: entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST /api/logs  — create a FoodEntry and recompute DayAggregate
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
    const {
      rawInput,
      name,
      calories,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      parseNote = null,
      parsedByModel,
      idempotencyKey = null,
    } = req.body;

    if (!rawInput || !name || calories == null || !parsedByModel) {
      res.status(400).json({ error: 'rawInput, name, calories, parsedByModel required' });
      return;
    }

    // Idempotency check — reject duplicate submissions
    if (idempotencyKey) {
      const existing = await FoodEntry.findOne({ idempotencyKey }).lean();
      if (existing) {
        res.status(200).json({ data: existing, duplicate: true });
        return;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const entry = await FoodEntry.create({
      userId,
      mealDate: today,
      loggedAt: new Date(),
      rawInput,
      parsedAt: new Date(),
      parsedByModel,
      name,
      calories: Math.round(calories),
      proteinG: proteinG ?? 0,
      carbsG:   carbsG   ?? 0,
      fatG:     fatG     ?? 0,
      fiberG:   fiberG   ?? 0,
      parseNote,
      isDeleted: false,
      deletedAt: null,
      source: 'user_input',
      idempotencyKey,
    });

    await computeDayAggregate(userId, today);

    res.status(201).json({ data: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// DELETE /api/logs/:id  — soft-delete a FoodEntry and recompute DayAggregate
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
    const entryId = new Types.ObjectId(String(req.params['id']));

    const entry = await FoodEntry.findOneAndUpdate(
      { _id: entryId, userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );

    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    await computeDayAggregate(userId, entry.mealDate);

    res.json({ data: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
