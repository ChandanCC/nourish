import mongoose, { Schema, Document, Types } from 'mongoose';
import type { NutritionConfidence } from './FoodEntry';

export interface IPersonalFoodMemory extends Document {
  userId: Types.ObjectId;
  normalizedText: string;   // lowercase, trimmed, collapsed whitespace
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;
  confidence: NutritionConfidence;
  sourceModel: string;
  ironMg: number;
  calciumMg: number;
  vitaminDMcg: number;
  vitaminB12Mcg: number;
  magnesiumMg: number;
  zincMg: number;
  potassiumMg: number;
  sodiumMg: number;
  hitCount: number;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalFoodMemorySchema = new Schema<IPersonalFoodMemory>(
  {
    userId:         { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    normalizedText: { type: String, required: true },
    name:           { type: String, required: true },
    calories:       { type: Number, required: true },
    proteinG:       { type: Number, required: true },
    carbsG:         { type: Number, required: true },
    fatG:           { type: Number, required: true },
    fiberG:         { type: Number, required: true },
    parseNote:      { type: String, default: null },
    confidence:     { type: String, required: true },
    sourceModel:    { type: String, required: true },
    ironMg:         { type: Number, default: 0 },
    calciumMg:      { type: Number, default: 0 },
    vitaminDMcg:    { type: Number, default: 0 },
    vitaminB12Mcg:  { type: Number, default: 0 },
    magnesiumMg:    { type: Number, default: 0 },
    zincMg:         { type: Number, default: 0 },
    potassiumMg:    { type: Number, default: 0 },
    sodiumMg:       { type: Number, default: 0 },
    hitCount:       { type: Number, default: 1 },
    lastUsedAt:     { type: Date, default: Date.now },
  },
  { timestamps: true },
);

PersonalFoodMemorySchema.index({ userId: 1, normalizedText: 1 }, { unique: true });

export const PersonalFoodMemory = mongoose.model<IPersonalFoodMemory>('PersonalFoodMemory', PersonalFoodMemorySchema);
