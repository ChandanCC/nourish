import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var is not set');

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
  });

  isConnected = true;
  console.log('MongoDB connected');
}
