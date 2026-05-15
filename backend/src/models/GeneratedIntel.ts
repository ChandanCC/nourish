import mongoose, { Schema, Document, Types } from 'mongoose';

export type IntelLevel = 'meal' | 'session' | 'daily' | 'weekly' | 'monthly';
export type DayRating = 'STRONG' | 'SOLID' | 'SHORT' | 'WEAK';

export interface IGeneratedIntel extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  level: IntelLevel;
  refId: string;        // entryId | sessionId | date | "YYYY-WNN" | "YYYY-MM"
  metrics: Record<string, unknown>;
  narrative: string;
  instruction: string | null;
  projection: string | null;
  dayRating: DayRating | null;
  aiModel: string;
  generatedAt: Date;
  dataChecksum: string;
}

const GeneratedIntelSchema = new Schema<IGeneratedIntel>(
  {
    userId:       { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    level:        { type: String, required: true, enum: ['meal', 'session', 'daily', 'weekly', 'monthly'] },
    refId:        { type: String, required: true },
    metrics:      { type: Schema.Types.Mixed, default: {} },
    narrative:    { type: String, required: true },
    instruction:  { type: String, default: null },
    projection:   { type: String, default: null },
    dayRating:    { type: String, default: null, enum: ['STRONG', 'SOLID', 'SHORT', 'WEAK', null] },
    aiModel:      { type: String, default: '' },
    generatedAt:  { type: Date, default: Date.now },
    dataChecksum: { type: String, required: true },
  },
  { timestamps: false },
);

GeneratedIntelSchema.index({ userId: 1, level: 1, refId: 1 }, { unique: true });

export const GeneratedIntel = mongoose.model<IGeneratedIntel>('GeneratedIntel', GeneratedIntelSchema);
