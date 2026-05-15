import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { TrainingSession } from '../models/TrainingSession';
import { DayAggregate } from '../models/DayAggregate';

const MET: Record<string, number> = {
  gym:   4.0,
  run:   8.0,
  cycle: 6.0,
  swim:  7.0,
  sport: 6.0,
  other: 3.5,
};

const ExerciseSetSchema = z.object({
  reps:     z.number().int().min(1),
  weightKg: z.number().min(0),
});

const ExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  sets: z.array(ExerciseSetSchema).default([]),
});

const LogTrainingSchema = z.object({
  activityType: z.enum(['gym', 'run', 'cycle', 'swim', 'sport', 'other']),
  durationMin:  z.number().int().min(1).max(600),
  userWeightKg: z.number().min(20).max(300),
  bodyParts:    z.array(z.string()).optional().default([]),
  exercises:    z.array(ExerciseSchema).optional().default([]),
  distanceKm:   z.number().min(0).optional(),
  description:  z.string().max(200).optional(),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function recalcDayAggregate(userId: Types.ObjectId, date: string) {
  const sessions = await TrainingSession.find({ userId, date, isDeleted: false }).lean();

  const totalCaloriesBurnt = sessions.reduce((s, t) => s + t.caloriesBurnt, 0);
  const totalVolumeKg = sessions.reduce((s, t) => s + (t.totalVolumeKg ?? 0), 0);
  const sessionIds = sessions.map(t => t._id);

  await DayAggregate.findOneAndUpdate(
    { userId, date },
    {
      $set: {
        trainingLogged: sessions.length > 0,
        trainingSessionIds: sessionIds,
        totalVolumeKg: totalVolumeKg > 0 ? totalVolumeKg : null,
        totalCaloriesBurntTraining: totalCaloriesBurnt,
      },
    },
    { upsert: false },
  );
}

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const parsed = LogTrainingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { activityType, durationMin, userWeightKg, bodyParts, exercises, distanceKm, description, date } = parsed.data;
  const userId = new Types.ObjectId(req.user!.userId);
  const sessionDate = date ?? new Date().toISOString().split('T')[0];

  const caloriesBurnt = Math.round(MET[activityType] * userWeightKg * (durationMin / 60));

  let totalVolumeKg = 0;
  if (activityType === 'gym' && exercises && exercises.length > 0) {
    totalVolumeKg = exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((s, set) => s + set.reps * set.weightKg, 0);
    }, 0);
  }

  const session = await TrainingSession.create({
    userId,
    date: sessionDate,
    activityType,
    durationMin,
    caloriesBurnt,
    bodyParts: bodyParts ?? [],
    exercises: exercises ?? [],
    totalVolumeKg,
    distanceKm,
    description,
  });

  await recalcDayAggregate(userId, sessionDate);

  // Fire-and-forget signal recompute
  const apiBase = process.env.API_BASE_URL || 'http://localhost:4000/api';
  fetch(`${apiBase}/signal/recompute`, {
    method: 'POST',
    headers: { Authorization: req.headers.authorization ?? '' },
  }).catch(() => { /* non-critical */ });

  return res.status(201).json({ data: session });
});

router.patch('/:id', async (req: Request, res: Response) => {
  const parsed = LogTrainingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const userId = new Types.ObjectId(req.user!.userId);
  const id = String(req.params['id']);

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { activityType, durationMin, userWeightKg, bodyParts, exercises, distanceKm, description } = parsed.data;

  const caloriesBurnt = Math.round(MET[activityType] * userWeightKg * (durationMin / 60));

  let totalVolumeKg = 0;
  if (activityType === 'gym' && exercises && exercises.length > 0) {
    totalVolumeKg = exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((s, set) => s + set.reps * set.weightKg, 0);
    }, 0);
  }

  const session = await TrainingSession.findOneAndUpdate(
    { _id: new Types.ObjectId(id), userId, isDeleted: false },
    {
      $set: {
        activityType,
        durationMin,
        caloriesBurnt,
        bodyParts: bodyParts ?? [],
        exercises: exercises ?? [],
        totalVolumeKg,
        distanceKm: distanceKm ?? undefined,
        description: description ?? undefined,
      },
    },
    { new: true },
  );

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await recalcDayAggregate(userId, session.date);

  return res.json({ data: session });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const id = String(req.params['id']);

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const session = await TrainingSession.findOneAndUpdate(
    { _id: new Types.ObjectId(id), userId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true },
  );

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await recalcDayAggregate(userId, session.date);

  return res.json({ ok: true });
});

export default router;
