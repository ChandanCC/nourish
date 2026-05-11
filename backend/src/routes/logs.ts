import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { FoodEntry } from '../models/FoodEntry';
import { computeDayAggregate } from '../services/computeDayAggregate';
import { validate } from '../middleware/validate';
import { normalizeInput, storeFoodMemory } from '../services/foodMemory';

const CONFIDENCE_VALUES = ['recalled','estimated','low_confidence','matched','verified','user_corrected'] as const;
const SOURCE_TYPE_VALUES = ['personal_memory','ai_estimate','authoritative_db','user_input'] as const;

const logEntrySchema = z.object({
  rawInput:       z.string().min(1).max(2000),
  name:           z.string().min(1).max(200),
  calories:       z.number().int().min(0).max(10000),
  proteinG:       z.number().min(0).max(500).default(0),
  carbsG:         z.number().min(0).max(1000).default(0),
  fatG:           z.number().min(0).max(500).default(0),
  fiberG:         z.number().min(0).max(200).default(0),
  parseNote:      z.string().max(500).nullable().default(null),
  parsedByModel:  z.string().min(1).max(150),
  confidence:     z.enum(CONFIDENCE_VALUES).default('estimated'),
  sourceType:     z.enum(SOURCE_TYPE_VALUES).default('ai_estimate'),
  sourceId:       z.string().max(200).nullable().default(null),
  ironMg:         z.number().min(0).default(0),
  calciumMg:      z.number().min(0).default(0),
  vitaminDMcg:    z.number().min(0).default(0),
  vitaminB12Mcg:  z.number().min(0).default(0),
  magnesiumMg:    z.number().min(0).default(0),
  zincMg:         z.number().min(0).default(0),
  potassiumMg:    z.number().min(0).default(0),
  sodiumMg:       z.number().min(0).default(0),
  idempotencyKey: z.string().uuid().nullable().default(null),
});

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
router.post('/', validate(logEntrySchema), async (req: Request, res: Response) => {
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
      parseNote,
      parsedByModel,
      confidence,
      sourceType,
      sourceId,
      ironMg,
      calciumMg,
      vitaminDMcg,
      vitaminB12Mcg,
      magnesiumMg,
      zincMg,
      potassiumMg,
      sodiumMg,
      idempotencyKey,
    } = req.body;

    // Idempotency check — isDeleted intentionally omitted: duplicate guard spans full key history including soft-deleted entries
    if (idempotencyKey) {
      const existing = await FoodEntry.findOne({ idempotencyKey }).lean(); // invariant-exception: idempotency
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
      confidence:  confidence  ?? 'estimated',
      sourceType:  sourceType  ?? 'ai_estimate',
      sourceId:    sourceId    ?? null,
      ironMg:        ironMg        ?? 0,
      calciumMg:     calciumMg     ?? 0,
      vitaminDMcg:   vitaminDMcg   ?? 0,
      vitaminB12Mcg: vitaminB12Mcg ?? 0,
      magnesiumMg:   magnesiumMg   ?? 0,
      zincMg:        zincMg        ?? 0,
      potassiumMg:   potassiumMg   ?? 0,
      sodiumMg:      sodiumMg      ?? 0,
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

const editEntrySchema = z.object({
  rawInput:      z.string().min(1).max(2000),
  name:          z.string().min(1).max(200),
  calories:      z.number().int().min(0).max(10000),
  proteinG:      z.number().min(0).max(500).default(0),
  carbsG:        z.number().min(0).max(1000).default(0),
  fatG:          z.number().min(0).max(500).default(0),
  fiberG:        z.number().min(0).max(200).default(0),
  parseNote:     z.string().max(500).nullable().default(null),
  parsedByModel: z.string().max(150).default('user_edit'),
  ironMg:        z.number().min(0).default(0),
  calciumMg:     z.number().min(0).default(0),
  vitaminDMcg:   z.number().min(0).default(0),
  vitaminB12Mcg: z.number().min(0).default(0),
  magnesiumMg:   z.number().min(0).default(0),
  zincMg:        z.number().min(0).default(0),
  potassiumMg:   z.number().min(0).default(0),
  sodiumMg:      z.number().min(0).default(0),
});

// PATCH /api/logs/:id  — re-analyse edit: updates rawInput + all nutrition, marks user_corrected
router.patch('/:id', validate(editEntrySchema), async (req: Request, res: Response) => {
  try {
    const userId  = new Types.ObjectId(req.user!.userId);
    const entryId = new Types.ObjectId(String(req.params['id']));
    const {
      rawInput, name, calories, proteinG, carbsG, fatG, fiberG,
      parseNote, parsedByModel,
      ironMg, calciumMg, vitaminDMcg, vitaminB12Mcg, magnesiumMg, zincMg, potassiumMg, sodiumMg,
    } = req.body;

    const entry = await FoodEntry.findOneAndUpdate(
      { _id: entryId, userId, isDeleted: false },
      {
        $set: {
          rawInput,
          name,
          calories: Math.round(calories),
          proteinG, carbsG, fatG, fiberG,
          parseNote, parsedByModel,
          ironMg, calciumMg, vitaminDMcg, vitaminB12Mcg, magnesiumMg, zincMg, potassiumMg, sodiumMg,
          confidence: 'user_corrected',
          sourceType: 'user_input',
        },
      },
      { new: true },
    );

    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    await computeDayAggregate(userId, entry.mealDate);

    await storeFoodMemory(userId, normalizeInput(rawInput), {
      name, calories, proteinG, carbsG, fatG, fiberG, parseNote,
      ironMg, calciumMg, vitaminDMcg, vitaminB12Mcg, magnesiumMg, zincMg, potassiumMg, sodiumMg,
    }, 'user_edit', 'user_corrected');

    res.json({ data: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
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
