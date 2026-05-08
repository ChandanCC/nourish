import { Types } from 'mongoose';
import { DayAggregate } from '../models/DayAggregate';
import { User } from '../models/User';
import { SignalState } from '../models/SignalState';
import { BaselineSnapshot } from '../models/BaselineSnapshot';
import { computeSignal } from './intelligence/orchestrator';
import type { DayData } from './intelligence/types';

export async function recomputeSignal(userId: Types.ObjectId): Promise<void> {
  const user = await User.findById(userId).lean();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // All logged DayAggregates for baseline computation
  const allAggregates = await DayAggregate.find({ userId })
    .sort({ date: 1 })
    .lean();

  // 14-day window for Tier 1
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  const windowStart = fourteenDaysAgo.toISOString().split('T')[0];

  const window14 = allAggregates.filter(a => a.date >= windowStart && a.date <= today);

  const toDayData = (a: typeof allAggregates[number]): DayData => ({
    date: a.date,
    calories: a.totalCalories,
    proteinG: a.totalProteinG,
    proteinAdherencePct: a.proteinAdherencePct,
    trainingLogged: a.trainingLogged,
    totalVolumeKg: a.totalVolumeKg,
  });

  const accountCreatedAt = (user as any).createdAt ?? new Date();
  const accountAgeDays = Math.round(
    (Date.now() - new Date(accountCreatedAt).getTime()) / 86400000,
  );

  const trainingSessions7d = window14
    .filter(a => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      return a.date >= sevenDaysAgo.toISOString().split('T')[0] && a.trainingLogged;
    }).length;

  const DEFAULT_PROTEIN_TARGET = 160;

  const result = computeSignal({
    userId: userId.toString(),
    allLoggedDays: allAggregates.map(toDayData),
    window14Days: window14.map(toDayData),
    proteinTargetG: DEFAULT_PROTEIN_TARGET,
    goal: 'maintain',
    accountAgeDays,
    trainingSessions7d,
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Supersede current state
  const prevState = await SignalState.findOneAndUpdate(
    { userId, isCurrentState: true },
    { $set: { isCurrentState: false, supersededAt: new Date() } },
  );

  const newState = await SignalState.create({
    userId,
    state: result.state,
    patternQualifier: result.patternQualifier,
    stateDays: 1,
    computedAt: new Date(),
    windowStartDate: sevenDaysAgo.toISOString().split('T')[0],
    windowEndDate: today,
    confidenceScore: result.confidenceScore,
    deltaPercent: result.deltaPercent,
    avgCalories7d: result.tier1.avgCalories7d,
    proteinAdherence5d: result.tier1.proteinAdherence5d,
    cv7d: result.tier2.cv7d,
    aiModel: '',
    aiReasoning: '',
    isCurrentState: true,
    triggerType: 'log_entry',
  });

  if (prevState) {
    await SignalState.updateOne(
      { _id: prevState._id },
      { $set: { supersededByStateId: newState._id } },
    );
  }

  // Persist baseline snapshot if established and changed
  if (result.tier2.baseline.baselineEstablished && result.tier2.baseline.baselineKcal !== null) {
    const currentSnapshot = await BaselineSnapshot.findOne({ userId, isCurrent: true }).lean();
    const newBaseline = result.tier2.baseline.baselineKcal;

    const shouldUpdate = !currentSnapshot ||
      Math.abs((newBaseline - currentSnapshot.baselineKcal) / currentSnapshot.baselineKcal) > 0.01;

    if (shouldUpdate) {
      const prevVersion = currentSnapshot?.version ?? 0;
      await BaselineSnapshot.updateMany({ userId, isCurrent: true }, { $set: { isCurrent: false, supersededAt: new Date() } });

      const windowDays = allAggregates.filter(a => a.totalCalories > 0);
      const windowStartDate = windowDays.length > 0 ? windowDays[0]!.date : today;

      await BaselineSnapshot.create({
        userId,
        version: prevVersion + 1,
        baselineKcal: newBaseline,
        computedAt: new Date(),
        algorithm: 'weighted-median-v1',
        loggedDaysUsed: result.tier2.baseline.loggedDaysUsed,
        windowStartDate,
        windowEndDate: today,
        isEstablished: true,
        isCurrent: true,
        triggeredByLoggedDayCount: windowDays.length,
      });
    }
  }
}
