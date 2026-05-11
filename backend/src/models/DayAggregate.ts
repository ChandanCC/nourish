import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDayAggregate extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string;            // "YYYY-MM-DD" in user's timezone

  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  entryCount: number;

  proteinTargetG: number;
  proteinAdherencePct: number;

  totalIronMg: number;
  totalCalciumMg: number;
  totalVitaminDMcg: number;
  totalVitaminB12Mcg: number;
  totalMagnesiumMg: number;
  totalZincMg: number;
  totalPotassiumMg: number;
  totalSodiumMg: number;

  trainingLogged: boolean;
  trainingSessionIds: Types.ObjectId[];
  totalVolumeKg: number | null;

  isComplete: boolean;

  computedAt: Date;
  goalProfileVersion: number;
  foodEntryIds: Types.ObjectId[];
}

const DayAggregateSchema = new Schema<IDayAggregate>(
  {
    userId:    { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    date:      { type: String, required: true },

    totalCalories:      { type: Number, default: 0 },
    totalProteinG:      { type: Number, default: 0 },
    totalCarbsG:        { type: Number, default: 0 },
    totalFatG:          { type: Number, default: 0 },
    totalFiberG:        { type: Number, default: 0 },
    entryCount:         { type: Number, default: 0 },

    proteinTargetG:        { type: Number, default: 0 },
    proteinAdherencePct:   { type: Number, default: 0 },

    totalIronMg:        { type: Number, default: 0 },
    totalCalciumMg:     { type: Number, default: 0 },
    totalVitaminDMcg:   { type: Number, default: 0 },
    totalVitaminB12Mcg: { type: Number, default: 0 },
    totalMagnesiumMg:   { type: Number, default: 0 },
    totalZincMg:        { type: Number, default: 0 },
    totalPotassiumMg:   { type: Number, default: 0 },
    totalSodiumMg:      { type: Number, default: 0 },

    trainingLogged:        { type: Boolean, default: false },
    trainingSessionIds:    { type: [Schema.Types.ObjectId], default: [] },
    totalVolumeKg:         { type: Number, default: null },

    isComplete:            { type: Boolean, default: false },

    computedAt:            { type: Date, default: Date.now },
    goalProfileVersion:    { type: Number, default: 0 },
    foodEntryIds:          { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: false },
);

DayAggregateSchema.index({ userId: 1, date: 1 }, { unique: true });
DayAggregateSchema.index({ userId: 1, date: -1 });
DayAggregateSchema.index({ userId: 1, isComplete: 1 });

export const DayAggregate = mongoose.model<IDayAggregate>('DayAggregate', DayAggregateSchema);
