import { router } from '../server';

import { activeRouter } from './active';
import { authRouter } from './auth';
import { fileRouter } from './file';
import { itemProposalRouter } from './itemProposal';
import { likeProjectRouter } from './likeProject';
import { notificationRouter } from './notification';
import { projectRouter } from './project';
import { projectLogRouter } from './projectLog';
import { proposalRouter } from './proposal';
import { rankRouter } from './rank';
import { smartContractsRouter } from './smartContracts';
import { userRouter } from './user';
import { voteRouter } from './vote';

export const appRouter = router({
  user: userRouter,
  auth: authRouter,
  file: fileRouter,
  project: projectRouter,
  proposal: proposalRouter,
  itemProposal: itemProposalRouter,
  likeProject: likeProjectRouter,
  notification: notificationRouter,
  active: activeRouter,
  vote: voteRouter,
  projectLog: projectLogRouter,
  rank: rankRouter,
  smartContracts: smartContractsRouter,
});

export type AppRouter = typeof appRouter;
