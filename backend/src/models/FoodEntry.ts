import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFoodEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  mealDate: string;         // "YYYY-MM-DD" in user's timezone
  loggedAt: Date;

  rawInput: string;         // immutable — exactly what the user typed
  parsedAt: Date;
  parsedByModel: string;    // canonical "provider:model" e.g. "anthropic:claude-sonnet-4-6"
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;

  isDeleted: boolean;
  deletedAt: Date | null;

  source: 'user_input';
  idempotencyKey: string | null;
}

const FoodEntrySchema = new Schema<IFoodEntry>(
  {
    userId:         { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    mealDate:       { type: String, required: true },
    loggedAt:       { type: Date, default: Date.now },

    rawInput:       { type: String, required: true },
    parsedAt:       { type: Date, required: true },
    parsedByModel:  { type: String, required: true },
    name:           { type: String, required: true },
    calories:       { type: Number, required: true },
    proteinG:       { type: Number, required: true },
    carbsG:         { type: Number, required: true },
    fatG:           { type: Number, required: true },
    fiberG:         { type: Number, required: true },
    parseNote:      { type: String, default: null },

    isDeleted:      { type: Boolean, default: false },
    deletedAt:      { type: Date, default: null },

    source:         { type: String, enum: ['user_input'], default: 'user_input' },
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: false },
);

FoodEntrySchema.index({ userId: 1, mealDate: 1 });
FoodEntrySchema.index({ userId: 1, loggedAt: -1 });
FoodEntrySchema.index({ userId: 1, isDeleted: 1 });
FoodEntrySchema.index({ idempotencyKey: 1 }, { sparse: true });

export const FoodEntry = mongoose.model<IFoodEntry>('FoodEntry', FoodEntrySchema);
