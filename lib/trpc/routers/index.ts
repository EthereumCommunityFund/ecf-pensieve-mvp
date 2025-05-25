import { router } from '../server';

import { activeRouter } from './active';
import { authRouter } from './auth';
import { fileRouter } from './file';
import { itemProposalRouter } from './itemProposal';
import { projectRouter } from './project';
import { proposalRouter } from './proposal';
import { userRouter } from './user';
import { voteRouter } from './vote';

export const appRouter = router({
  user: userRouter,
  auth: authRouter,
  file: fileRouter,
  project: projectRouter,
  proposal: proposalRouter,
  itemProposal: itemProposalRouter,
  active: activeRouter,
  vote: voteRouter,
});

export type AppRouter = typeof appRouter;
