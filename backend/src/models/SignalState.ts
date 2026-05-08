import mongoose, { Schema, Document, Types } from 'mongoose';
import type { StateLabel, PatternQualifier } from '../services/intelligence/types';

export interface ISignalState extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  state: StateLabel;
  patternQualifier: PatternQualifier | null;
  stateDays: number;

  computedAt: Date;
  baselineSnapshotVersion: number;
  goalProfileVersion: number;
  windowStartDate: string;
  windowEndDate: string;

  confidenceScore: number;
  deltaPercent: number | null;
  avgCalories7d: number | null;
  proteinAdherence5d: number | null;
  cv7d: number | null;

  aiModel: string;
  aiReasoning: string;

  isCurrentState: boolean;
  supersededAt: Date | null;
  supersededByStateId: Types.ObjectId | null;

  triggerType: 'log_entry' | 'schedule' | 'goal_change' | 'recalibration';
}

const SignalStateSchema = new Schema<ISignalState>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    state:            { type: String, required: true },
    patternQualifier: { type: String, default: null },
    stateDays:        { type: Number, default: 1 },

    computedAt:             { type: Date, default: Date.now },
    baselineSnapshotVersion:{ type: Number, default: 0 },
    goalProfileVersion:     { type: Number, default: 0 },
    windowStartDate:        { type: String, required: true },
    windowEndDate:          { type: String, required: true },

    confidenceScore:   { type: Number, default: 0 },
    deltaPercent:      { type: Number, default: null },
    avgCalories7d:     { type: Number, default: null },
    proteinAdherence5d:{ type: Number, default: null },
    cv7d:              { type: Number, default: null },

    aiModel:    { type: String, default: '' },
    aiReasoning:{ type: String, default: '' },

    isCurrentState:       { type: Boolean, default: true },
    supersededAt:         { type: Date, default: null },
    supersededByStateId:  { type: Schema.Types.ObjectId, default: null },

    triggerType: {
      type: String,
      enum: ['log_entry', 'schedule', 'goal_change', 'recalibration'],
      default: 'log_entry',
    },
  },
  { timestamps: false },
);

SignalStateSchema.index({ userId: 1, isCurrentState: 1 });
SignalStateSchema.index({ userId: 1, computedAt: -1 });

export const SignalState = mongoose.model<ISignalState>('SignalState', SignalStateSchema);
