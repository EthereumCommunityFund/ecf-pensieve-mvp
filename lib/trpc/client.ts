import { createTRPCReact } from '@trpc/react-query';

import { AppRouter } from './routers';

export const trpc = createTRPCReact<AppRouter>();
