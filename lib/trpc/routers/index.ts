import { router } from '../server';

import { activeRouter } from './active';
import { authRouter } from './auth';
import { fileRouter } from './file';
import { itemProposalRouter } from './itemProposal';
import { likeProjectRouter } from './likeProject';
import { listRouter } from './list';
import { notificationRouter } from './notification';
import { projectRouter } from './project';
import { projectLogRouter } from './projectLog';
import { projectNotificationSettingsRouter } from './projectNotificationSettings';
import { projectRelationRouter } from './projectRelation';
import { proposalRouter } from './proposal';
import { rankRouter } from './rank';
import { shareRouter } from './share';
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
  list: listRouter,
  notification: notificationRouter,
  projectNotificationSettings: projectNotificationSettingsRouter,
  active: activeRouter,
  vote: voteRouter,
  projectLog: projectLogRouter,
  projectRelation: projectRelationRouter,
  rank: rankRouter,
  smartContracts: smartContractsRouter,
  share: shareRouter,
});

export type AppRouter = typeof appRouter;
