import mongoose, { Schema, Document, Types } from 'mongoose';

export type ActivityType = 'gym' | 'run' | 'cycle' | 'swim' | 'sport' | 'other';

export interface ExerciseSet {
  reps: number;
  weightKg: number;
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

export interface ITrainingSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string;
  activityType: ActivityType;
  durationMin: number;
  caloriesBurnt: number;
  bodyParts: string[];
  exercises: Exercise[];
  totalVolumeKg: number;
  distanceKm?: number;
  steps?: number;
  description?: string;
  isDeleted: boolean;
}

const ExerciseSetSchema = new Schema<ExerciseSet>(
  { reps: { type: Number, required: true }, weightKg: { type: Number, required: true } },
  { _id: false },
);

const ExerciseSchema = new Schema<Exercise>(
  { name: { type: String, required: true }, sets: { type: [ExerciseSetSchema], default: [] } },
  { _id: false },
);

const TrainingSessionSchema = new Schema<ITrainingSession>(
  {
    userId:        { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    date:          { type: String, required: true },
    activityType:  { type: String, required: true, enum: ['gym', 'run', 'cycle', 'swim', 'sport', 'other'] },
    durationMin:   { type: Number, required: true },
    caloriesBurnt: { type: Number, required: true },
    bodyParts:     { type: [String], default: [] },
    exercises:     { type: [ExerciseSchema], default: [] },
    totalVolumeKg: { type: Number, default: 0 },
    distanceKm:    { type: Number },
    steps:         { type: Number, min: 0 },
    description:   { type: String },
    isDeleted:     { type: Boolean, default: false },
  },
  { timestamps: true },
);

TrainingSessionSchema.index({ userId: 1, date: 1 });
TrainingSessionSchema.index({ userId: 1, date: -1, isDeleted: 1 });

export const TrainingSession = mongoose.model<ITrainingSession>('TrainingSession', TrainingSessionSchema);
