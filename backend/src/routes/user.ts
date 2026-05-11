import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { User } from '../models/User';
import { validate } from '../middleware/validate';

const PROTEIN_MULTIPLIER: Record<string, number> = {
  muscle_gain: 2.0,
  fat_loss:    2.2,
  performance: 2.0,
  maintenance: 1.6,
};

const onboardingSchema = z.object({
  goal:      z.enum(['muscle_gain', 'fat_loss', 'maintenance', 'performance']),
  weight_kg: z.number().min(20).max(300),
});

const router = Router();

router.patch('/onboarding', validate(onboardingSchema), async (req: Request, res: Response) => {
  const { goal, weight_kg } = req.body as z.infer<typeof onboardingSchema>;

  const multiplier    = PROTEIN_MULTIPLIER[goal] ?? 1.6;
  const proteinTargetG = Math.round(multiplier * weight_kg);

  const userId = new Types.ObjectId(req.user!.userId);
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { goal, weightKg: weight_kg, proteinTargetG, onboardingComplete: true } },
    { new: true, select: '-__v' },
  ).lean();

  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ ok: true, user: updated });
});

export default router;
