import { router } from '../server';

import { authRouter } from './auth';
import { projectRouter } from './project';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  auth: authRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
