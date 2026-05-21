import serverless from 'serverless-http';
import { connectDB } from './lib/db';
import app from './app';

type LambdaContext = { callbackWaitsForEmptyEventLoop: boolean };

let serverlessHandler: ReturnType<typeof serverless>;

async function getHandler() {
  if (!serverlessHandler) {
    await connectDB();
    serverlessHandler = serverless(app);
  }
  return serverlessHandler;
}

export const handler = async (event: Record<string, unknown>, context: LambdaContext) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const h = await getHandler();
  return h(event, context);
};
