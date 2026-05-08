import { Types } from 'mongoose';
import { FoodEntry } from '../models/FoodEntry';
import { DayAggregate } from '../models/DayAggregate';

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
      },
    },
    { upsert: true },
  );
}
