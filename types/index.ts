import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/lib/trpc/routers';

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type IProfile = RouterOutputs['user']['getCurrentUser'];
export type IProjectDetail = RouterOutputs['project']['getProjectById'];
export type IProposal = RouterOutputs['proposal']['getProposalsByProjectId'][0];
export type IVote = RouterOutputs['vote']['getVotesByProposalId'][0];

export type IProposalWithVotes = IProposal & {
  voteRecords?: IVote[];
};

export type IProject = RouterOutputs['project']['getProjects']['items'][0] & {
  proposals: IProposalWithVotes[];
};
