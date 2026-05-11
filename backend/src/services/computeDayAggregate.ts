import { Types } from 'mongoose';
import { FoodEntry } from '../models/FoodEntry';
import { DayAggregate } from '../models/DayAggregate';
import { recomputeSignal } from './recomputeSignal';

const DEFAULT_PROTEIN_TARGET = 160;

export async function computeDayAggregate(
  userId: Types.ObjectId,
  date: string,
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const entries = await FoodEntry.find({
    userId,
    mealDate: date,
    isDeleted: false,
  }).lean();

  const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
  const totalProteinG = entries.reduce((s, e) => s + e.proteinG, 0);
  const totalCarbsG   = entries.reduce((s, e) => s + e.carbsG, 0);
  const totalFatG     = entries.reduce((s, e) => s + e.fatG, 0);
  const totalFiberG   = entries.reduce((s, e) => s + e.fiberG, 0);
  const entryCount    = entries.length;

  const totalIronMg        = entries.reduce((s, e) => s + (e.ironMg        ?? 0), 0);
  const totalCalciumMg     = entries.reduce((s, e) => s + (e.calciumMg     ?? 0), 0);
  const totalVitaminDMcg   = entries.reduce((s, e) => s + (e.vitaminDMcg   ?? 0), 0);
  const totalVitaminB12Mcg = entries.reduce((s, e) => s + (e.vitaminB12Mcg ?? 0), 0);
  const totalMagnesiumMg   = entries.reduce((s, e) => s + (e.magnesiumMg   ?? 0), 0);
  const totalZincMg        = entries.reduce((s, e) => s + (e.zincMg        ?? 0), 0);
  const totalPotassiumMg   = entries.reduce((s, e) => s + (e.potassiumMg   ?? 0), 0);
  const totalSodiumMg      = entries.reduce((s, e) => s + (e.sodiumMg      ?? 0), 0);

  const proteinTargetG = DEFAULT_PROTEIN_TARGET;
  const proteinAdherencePct = proteinTargetG > 0
    ? Math.min(totalProteinG / proteinTargetG, 1)
    : 0;

  const isComplete = date < today;

  await DayAggregate.findOneAndUpdate(
    { userId, date },
    {
      $set: {
        totalCalories,
        totalProteinG,
        totalCarbsG,
        totalFatG,
        totalFiberG,
        entryCount,
        proteinTargetG,
        proteinAdherencePct,
        isComplete,
        computedAt: new Date(),
        goalProfileVersion: 0,
        foodEntryIds: entries.map(e => e._id),
        totalIronMg,
        totalCalciumMg,
        totalVitaminDMcg,
        totalVitaminB12Mcg,
        totalMagnesiumMg,
        totalZincMg,
        totalPotassiumMg,
        totalSodiumMg,
      },
    },
    { upsert: true },
  );

  // Trigger SIGNAL recompute if date is in last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  if (date >= fourteenDaysAgo.toISOString().split('T')[0]) {
    recomputeSignal(userId).catch(err => console.error('recomputeSignal failed:', err));
  }
}
