import mongoose, { Schema, Document, Types } from 'mongoose';

export type NutritionConfidence =
  | 'recalled'        // personal memory hit — deterministic replay
  | 'estimated'       // AI parse, AI expressed high/medium confidence
  | 'low_confidence'  // AI parse, AI expressed low confidence
  | 'matched'         // authoritative DB match (future)
  | 'verified'        // barcode scan or user confirmation (future)
  | 'user_corrected'; // user edited values — overrides all

export type SourceType =
  | 'personal_memory'  // recalled from user's food memory
  | 'ai_estimate'      // AI semantic parse
  | 'authoritative_db' // USDA / Open Food Facts (future)
  | 'user_input';      // manual user correction (future)

export interface IFoodEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  mealDate: string;         // "YYYY-MM-DD" in user's timezone
  loggedAt: Date;

  rawInput: string;         // immutable — exactly what the user typed
  parsedAt: Date;
  parsedByModel: string;    // canonical "provider:model" e.g. "google:gemini-2.5-flash"
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;

  confidence: NutritionConfidence;
  sourceType: SourceType;
  sourceId: string | null;

  ironMg: number;
  calciumMg: number;
  vitaminDMcg: number;
  vitaminB12Mcg: number;
  magnesiumMg: number;
  zincMg: number;
  potassiumMg: number;
  sodiumMg: number;

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

    confidence:     { type: String, enum: ['recalled','estimated','low_confidence','matched','verified','user_corrected'], required: true },
    sourceType:     { type: String, enum: ['personal_memory','ai_estimate','authoritative_db','user_input'], required: true },
    sourceId:       { type: String, default: null },

    ironMg:         { type: Number, default: 0 },
    calciumMg:      { type: Number, default: 0 },
    vitaminDMcg:    { type: Number, default: 0 },
    vitaminB12Mcg:  { type: Number, default: 0 },
    magnesiumMg:    { type: Number, default: 0 },
    zincMg:         { type: Number, default: 0 },
    potassiumMg:    { type: Number, default: 0 },
    sodiumMg:       { type: Number, default: 0 },

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
