import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  picture: string;
  timezone: string;
  createdAt: Date;
  lastSeenAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId:   { type: String, required: true, unique: true },
    email:      { type: String, required: true },
    name:       { type: String, required: true },
    picture:    { type: String, default: '' },
    timezone:   { type: String, default: 'UTC' },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
