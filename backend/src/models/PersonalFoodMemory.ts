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
  sourceModel: string;      // canonical "provider:model" that generated this estimate
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
    hitCount:       { type: Number, default: 1 },
    lastUsedAt:     { type: Date, default: Date.now },
  },
  { timestamps: true },
);

PersonalFoodMemorySchema.index({ userId: 1, normalizedText: 1 }, { unique: true });

export const PersonalFoodMemory = mongoose.model<IPersonalFoodMemory>('PersonalFoodMemory', PersonalFoodMemorySchema);
