import 'dotenv/config';
import serverless from 'serverless-http';
import { connectDB } from './lib/db';
import app from './app';

// Keep DB connection alive across Lambda warm invocations
let isConnected = false;

const handler = serverless(app);

export const lambdaHandler = async (event: any, context: any) => {
  // Prevent Lambda from waiting for event loop to drain
  context.callbackWaitsForEmptyEventLoop = false;

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return handler(event, context);
};
