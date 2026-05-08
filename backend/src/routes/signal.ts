import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { DayAggregate } from '../models/DayAggregate';
import { SignalState } from '../models/SignalState';
import { User } from '../models/User';
import { computeSignal } from '../services/intelligence/orchestrator';
import { callTier3 } from '../services/intelligence/tier3';
import { getSignalSynthesisProvider } from '../providers/registry';
import type { DayData } from '../services/intelligence/types';

const router = Router();

// GET /api/signal — returns current SignalState
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
    const current = await SignalState.findOne({ userId, isCurrentState: true }).lean();
    res.json({ data: current });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch signal state' });
  }
});

// POST /api/signal/recompute — full Tier 1→2→3 computation
router.post('/recompute', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.userId);
    const user = await User.findById(userId).lean();
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const today = new Date().toISOString().split('T')[0];
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const windowStart = fourteenDaysAgo.toISOString().split('T')[0];

    const allAggregates = await DayAggregate.find({ userId }).sort({ date: 1 }).lean();
    const window14 = allAggregates.filter(a => a.date >= windowStart && a.date <= today);

    const toDayData = (a: typeof allAggregates[number]): DayData => ({
      date: a.date,
      calories: a.totalCalories,
      proteinG: a.totalProteinG,
      proteinAdherencePct: a.proteinAdherencePct,
      trainingLogged: a.trainingLogged,
      totalVolumeKg: a.totalVolumeKg,
    });

    const accountCreatedAt = (user as unknown as Record<string, unknown>)['createdAt'] as Date ?? new Date();
    const accountAgeDays = Math.round((Date.now() - new Date(accountCreatedAt).getTime()) / 86400000);
    const trainingSessions7d = window14.filter(a => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return a.date >= d.toISOString().split('T')[0] && a.trainingLogged;
    }).length;

    const DEFAULT_PROTEIN_TARGET = 160;

    // Tier 1 + 2 deterministic result
    const computeResult = computeSignal({
      userId: userId.toString(),
      allLoggedDays: allAggregates.map(toDayData),
      window14Days: window14.map(toDayData),
      proteinTargetG: DEFAULT_PROTEIN_TARGET,
      goal: 'maintain',
      accountAgeDays,
      trainingSessions7d,
    });

    // Tier 3: only call AI for non-safety, non-trivial states
    let finalState = computeResult.state;
    let finalPattern = computeResult.patternQualifier;
    let aiInstruction: string | null = null;
    let aiReasoning = '';
    let aiModelRecord = '';

    const synthesisProvider = getSignalSynthesisProvider();
    const shouldCallAI =
      synthesisProvider !== null &&
      computeResult.state !== 'READING' &&
      computeResult.state !== 'UNDERFUELLED' &&
      computeResult.confidenceScore >= 60;

    if (shouldCallAI) {
      const tier3 = await callTier3({
        computeResult,
        goal: 'maintain',
        proteinTargetG: DEFAULT_PROTEIN_TARGET,
        baselineKcal: computeResult.baselineKcal,
        baselineEstablished: computeResult.tier2.baseline.baselineEstablished,
        accountAgeDays,
        trainingSessions7d,
      });

      if (tier3) {
        finalState = tier3.state;
        finalPattern = tier3.pattern;
        aiInstruction = tier3.aiInstruction;
        aiReasoning = tier3.reasoning;
        aiModelRecord = `${tier3.providerId}:${tier3.modelId}`;
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Persist new SignalState
    await SignalState.updateMany({ userId, isCurrentState: true }, {
      $set: { isCurrentState: false, supersededAt: new Date() },
    });

    const newState = await SignalState.create({
      userId,
      state: finalState,
      patternQualifier: finalPattern,
      stateDays: 1,
      computedAt: new Date(),
      windowStartDate: sevenDaysAgo.toISOString().split('T')[0],
      windowEndDate: today,
      confidenceScore: computeResult.confidenceScore,
      deltaPercent: computeResult.deltaPercent,
      avgCalories7d: computeResult.tier1.avgCalories7d,
      proteinAdherence5d: computeResult.tier1.proteinAdherence5d,
      cv7d: computeResult.tier2.cv7d,
      aiModel: aiModelRecord,
      aiReasoning,
      isCurrentState: true,
      triggerType: 'log_entry',
    });

    res.json({
      data: {
        state: finalState,
        patternQualifier: finalPattern,
        deltaPercent: computeResult.deltaPercent,
        aiInstruction,
        confidenceScore: computeResult.confidenceScore,
      },
    });

    void newState;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signal computation failed' });
  }
});

export default router;
