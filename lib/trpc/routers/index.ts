import { router } from '../server';

import { authRouter } from './auth';
import { fileRouter } from './file';
import { projectRouter } from './project';
import { proposalRouter } from './proposal';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  auth: authRouter,
  file: fileRouter,
  project: projectRouter,
  proposal: proposalRouter,
});

export type AppRouter = typeof appRouter;
