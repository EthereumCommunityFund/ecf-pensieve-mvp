import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/lib/trpc/routers';

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type IProfile = RouterOutputs['user']['getCurrentUser'];
export type IProject = RouterOutputs['project']['getProjectById'];
export type IProposal = RouterOutputs['proposal']['getProposalsByProjectId'][0];
