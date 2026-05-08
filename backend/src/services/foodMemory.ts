import { Types } from 'mongoose';
import { PersonalFoodMemory } from '../models/PersonalFoodMemory';
import type { NutritionConfidence } from '../models/FoodEntry';

export function normalizeInput(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

export interface FoodMemoryValues {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;
}

export async function lookupFoodMemory(
  userId: Types.ObjectId,
  normalizedText: string,
): Promise<(FoodMemoryValues & { confidence: NutritionConfidence; sourceId: string }) | null> {
  const entry = await PersonalFoodMemory.findOneAndUpdate(
    { userId, normalizedText },
    { $inc: { hitCount: 1 }, $set: { lastUsedAt: new Date() } },
    { new: true },
  ).lean();

  if (!entry) return null;

  return {
    name:      entry.name,
    calories:  entry.calories,
    proteinG:  entry.proteinG,
    carbsG:    entry.carbsG,
    fatG:      entry.fatG,
    fiberG:    entry.fiberG,
    parseNote: entry.parseNote,
    confidence: 'recalled',
    sourceId:  String(entry._id),
  };
}

export async function storeFoodMemory(
  userId: Types.ObjectId,
  normalizedText: string,
  values: FoodMemoryValues,
  sourceModel: string,
  confidence: NutritionConfidence,
): Promise<void> {
  await PersonalFoodMemory.findOneAndUpdate(
    { userId, normalizedText },
    {
      $set: {
        name:        values.name,
        calories:    values.calories,
        proteinG:    values.proteinG,
        carbsG:      values.carbsG,
        fatG:        values.fatG,
        fiberG:      values.fiberG,
        parseNote:   values.parseNote,
        confidence,
        sourceModel,
        lastUsedAt:  new Date(),
      },
      $setOnInsert: { hitCount: 1 },
    },
    { upsert: true },
  );
}
