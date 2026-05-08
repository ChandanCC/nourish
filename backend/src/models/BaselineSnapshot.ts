import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBaselineSnapshot extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  version: number;

  baselineKcal: number;
  computedAt: Date;
  algorithm: string;
  loggedDaysUsed: number;
  windowStartDate: string;
  windowEndDate: string;

  isEstablished: boolean;
  isCurrent: boolean;
  supersededAt: Date | null;

  triggeredByLoggedDayCount: number;
}

const BaselineSnapshotSchema = new Schema<IBaselineSnapshot>(
  {
    userId:  { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    version: { type: Number, required: true },

    baselineKcal:     { type: Number, required: true },
    computedAt:       { type: Date, default: Date.now },
    algorithm:        { type: String, default: 'weighted-median-v1' },
    loggedDaysUsed:   { type: Number, required: true },
    windowStartDate:  { type: String, required: true },
    windowEndDate:    { type: String, required: true },

    isEstablished: { type: Boolean, default: false },
    isCurrent:     { type: Boolean, default: true },
    supersededAt:  { type: Date, default: null },

    triggeredByLoggedDayCount: { type: Number, default: 0 },
  },
  { timestamps: false },
);

BaselineSnapshotSchema.index({ userId: 1, isCurrent: 1 });
BaselineSnapshotSchema.index({ userId: 1, version: -1 });

export const BaselineSnapshot = mongoose.model<IBaselineSnapshot>(
  'BaselineSnapshot',
  BaselineSnapshotSchema,
);
