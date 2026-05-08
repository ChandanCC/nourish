import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { User, type UserGoal } from '../models/User';

const VALID_GOALS: UserGoal[] = ['muscle_gain', 'fat_loss', 'maintenance', 'performance'];

const router = Router();

router.patch('/onboarding', async (req: Request, res: Response) => {
  const { goal, protein_target } = req.body as { goal: unknown; protein_target: unknown };

  if (!VALID_GOALS.includes(goal as UserGoal)) {
    res.status(400).json({ error: 'Invalid goal' });
    return;
  }

  const rawTarget = Number(protein_target);
  if (!Number.isInteger(rawTarget)) {
    res.status(400).json({ error: 'protein_target must be an integer' });
    return;
  }
  const proteinTargetG = Math.max(30, Math.min(500, rawTarget));

  const userId = new Types.ObjectId(req.user!.userId);
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { goal, proteinTargetG, onboardingComplete: true } },
    { new: true, select: '-__v' },
  ).lean();

  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ ok: true, user: updated });
});

export default router;
