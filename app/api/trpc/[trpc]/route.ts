import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';

import { appRouter } from '@/lib/trpc/routers';
import { createTRPCContext } from '@/lib/trpc/server';

export const runtime = 'nodejs';

const handler = (req: NextRequest) => {
  console.log(
    `tRPC request: ${req.method} ${req.url} at ${new Date().toISOString()}`,
  );

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError: ({ path, error }) => {
      console.error(` tRPC error: ${path}`, {
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    },
  });
};

export { handler as GET, handler as POST };
