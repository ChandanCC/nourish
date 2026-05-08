import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { User } from '../models/User';
import { validate } from '../middleware/validate';

const onboardingSchema = z.object({
  goal:           z.enum(['muscle_gain', 'fat_loss', 'maintenance', 'performance']),
  protein_target: z.number().int().min(30).max(500),
});

const router = Router();

router.patch('/onboarding', validate(onboardingSchema), async (req: Request, res: Response) => {
  const { goal, protein_target: proteinTargetG } = req.body as z.infer<typeof onboardingSchema>;

  const userId = new Types.ObjectId(req.user!.userId);
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { goal, proteinTargetG: proteinTargetG, onboardingComplete: true } },
    { new: true, select: '-__v' },
  ).lean();

  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ ok: true, user: updated });
});

export default router;
