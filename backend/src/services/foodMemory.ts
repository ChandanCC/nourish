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
  ironMg: number;
  calciumMg: number;
  vitaminDMcg: number;
  vitaminB12Mcg: number;
  magnesiumMg: number;
  zincMg: number;
  potassiumMg: number;
  sodiumMg: number;
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
    name:          entry.name,
    calories:      entry.calories,
    proteinG:      entry.proteinG,
    carbsG:        entry.carbsG,
    fatG:          entry.fatG,
    fiberG:        entry.fiberG,
    parseNote:     entry.parseNote,
    ironMg:        (entry as unknown as Record<string, number>)['ironMg']        ?? 0,
    calciumMg:     (entry as unknown as Record<string, number>)['calciumMg']     ?? 0,
    vitaminDMcg:   (entry as unknown as Record<string, number>)['vitaminDMcg']   ?? 0,
    vitaminB12Mcg: (entry as unknown as Record<string, number>)['vitaminB12Mcg'] ?? 0,
    magnesiumMg:   (entry as unknown as Record<string, number>)['magnesiumMg']   ?? 0,
    zincMg:        (entry as unknown as Record<string, number>)['zincMg']        ?? 0,
    potassiumMg:   (entry as unknown as Record<string, number>)['potassiumMg']   ?? 0,
    sodiumMg:      (entry as unknown as Record<string, number>)['sodiumMg']      ?? 0,
    confidence:    'recalled',
    sourceId:      String(entry._id),
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
        name:          values.name,
        calories:      values.calories,
        proteinG:      values.proteinG,
        carbsG:        values.carbsG,
        fatG:          values.fatG,
        fiberG:        values.fiberG,
        parseNote:     values.parseNote,
        ironMg:        values.ironMg,
        calciumMg:     values.calciumMg,
        vitaminDMcg:   values.vitaminDMcg,
        vitaminB12Mcg: values.vitaminB12Mcg,
        magnesiumMg:   values.magnesiumMg,
        zincMg:        values.zincMg,
        potassiumMg:   values.potassiumMg,
        sodiumMg:      values.sodiumMg,
        confidence,
        sourceModel,
        lastUsedAt:    new Date(),
      },
      $setOnInsert: { hitCount: 1 },
    },
    { upsert: true },
  );
}
