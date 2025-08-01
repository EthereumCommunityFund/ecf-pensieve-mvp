import { inferRouterOutputs } from '@trpc/server';

import { IRef } from '@/components/pages/project/create/types';
import { AppRouter } from '@/lib/trpc/routers';
import { IPocItemKey, IProposalItem } from '@/types/item';

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type IProfile = RouterOutputs['user']['getCurrentUser'];
export type IProjectDetail = RouterOutputs['project']['getProjectById'];
export type IProposal = RouterOutputs['proposal']['getProposalsByProjectId'][0];
export type IVote = RouterOutputs['vote']['getVotesByProposalId'][0];

export type IProposalWithVotes = IProposal & {
  voteRecords?: IVote[];
};

export type IProject = RouterOutputs['project']['getProjectById'] & {
  creator: IProfileCreator;
  proposals: IProposalWithVotes[];
  projectSnap?: IProjectSnap;
};

export type IProjectSnap = {
  id: number;
  projectId: number;
  items: IProposalItem[];
  createdAt: Date;
};

// Profile type for creator information
export type IProfileCreator = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  address: string;
  weight: number | null;
  invitationCodeId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

// Proposal with creator information
export type IProposalWithCreator = {
  id: number;
  createdAt: Date;
  items: IProposalItem[];
  refs: IRef[] | null;
  projectId: number;
  creator: IProfileCreator;
};

// Item proposal with creator information
export type IItemProposalWithCreator = {
  id: number;
  createdAt: Date;
  key: string;
  value: any;
  ref: string | null;
  projectId: number;
  creator: IProfileCreator;
  reason: string | null;
};

export type IItemProposalVoteRecord = {
  id: number;
  itemProposalId: number;
  projectId: number;
  proposalId: number;
  key: IPocItemKey;
  createdAt: Date;
  creator: string;
  weight: number;
};

// Project log base structure
export type IProjectLogBase = {
  id: string;
  createdAt: Date;
  projectId: number | null;
  proposalId: number | null;
  itemProposalId: number | null;
  key: string | null;
  isNotLeading: boolean;
};

// Project log with proposal (withoutItemProposal)
export type IProjectLogWithProposal = IProjectLogBase & {
  proposalId: number;
  itemProposalId: null;
  proposal: IProposalWithCreator;
  itemProposal: null;
};

// Project log with item proposal (withItemProposal)
export type IProjectLogWithItemProposal = IProjectLogBase & {
  proposalId: number | null;
  itemProposalId: number;
  proposal: IProposalWithCreator | null;
  itemProposal: IItemProposalWithCreator;
};

// Leading proposals structure with typed arrays
export type ILeadingProposalsTyped = {
  withoutItemProposal: IProjectLogWithProposal[];
  withItemProposal: IProjectLogWithItemProposal[];
};

// Keep the original tRPC inferred types for compatibility
export type ILeadingProposals =
  RouterOutputs['projectLog']['getLeadingProposalsByProjectId'];
export type IProposalsByProjectIdAndKey =
  RouterOutputs['projectLog']['getProposalsByProjectIdAndKey'];
export type ILeadingProposalHistory =
  RouterOutputs['projectLog']['getLeadingProposalHistoryByProjectIdAndKey'];
