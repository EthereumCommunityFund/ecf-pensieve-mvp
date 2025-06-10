import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';

import { appRouter } from '@/lib/trpc/routers';
import { createTRPCContext } from '@/lib/trpc/server';

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ trpc error: ${path}`, `${error.message}`);
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
