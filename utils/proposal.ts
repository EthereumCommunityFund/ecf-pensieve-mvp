import { EssentialItemKeys } from '@/components/pages/project/create/types';
import {
  ItemQuorumMap,
  ItemWeightMap,
  TotalEssentialItemQuorumSum,
  TotalEssentialItemWeightSum,
} from '@/constants/proposal';
import { IProposal, IVote } from '@/types';

export interface IGetVoteResultOfProposalParams {
  proposalId: number;
  votesOfProposal: IVote[];
  userId?: string;
}

export interface IVoteResultOfItemParams
  extends IGetVoteResultOfProposalParams {
  key: string;
  userId?: string;
}

export interface IVoteResultOfProposal {
  proposalId: number;
  votesOfKeyInProposalMap: Record<string, IVote[]>;
  totalValidPointsOfProposal: number;
  totalSupportedUserWeightOfProposal: number;
  totalValidQuorumOfProposal: number;
  TotalEssentialItemWeightSum: number;
  TotalEssentialItemQuorumSum: number;
  percentageOfProposal: number;
  formattedPercentageOfProposal: string;
  isProposalValidated: boolean;
  isUserVotedInProposal: boolean;
}

export interface IVoteResultOfItem {
  proposalId: number;
  key: string;
  itemVotedMemberCount: number;
  itemPoints: number;
  itemPointsNeeded: number;
  isItemReachPointsNeeded: boolean;
  isItemReachQuorum: boolean;
  isItemValidated: boolean;
  isUserVotedInItem: boolean;
}

export interface IGetVoteResultOfProjectParams {
  projectId: number;
  votesOfProject: IVote[];
  proposals: IProposal[];
  userId?: string;
}

export interface IVoteResultOfProject {
  projectId: number;
  /*
    key: proposalId
    value: votes
  */
  votesOfProposalMap: Record<number, IVote[]>;
  /*
    key: proposalId
    value: proposal vote result
  */
  voteResultOfProposalMap: Record<number, IVoteResultOfProposal>;
  leadingProposalId?: number;
  leadingProposal?: IProposal;
  /**
   * if leadingProposalId is not set, leadingProposalResult will be the default proposal result
   */
  leadingProposalResult: IVoteResultOfProposal;
  canBePublished: boolean;
}

const DefaultProposalResult: IVoteResultOfProposal = {
  proposalId: 0,
  votesOfKeyInProposalMap: {},
  totalValidPointsOfProposal: 0,
  totalSupportedUserWeightOfProposal: 0,
  totalValidQuorumOfProposal: 0,
  TotalEssentialItemWeightSum,
  TotalEssentialItemQuorumSum,
  percentageOfProposal: 0,
  formattedPercentageOfProposal: '0%',
  isProposalValidated: false,
  isUserVotedInProposal: false,
};

const ProposalVoteUtils = {
  groupVotesByKey: (votes: IVote[] = []): Record<string, IVote[]> => {
    return votes.reduce(
      (acc, vote) => {
        if (!acc[vote.key]) {
          acc[vote.key] = [];
        }
        acc[vote.key].push(vote);
        return acc;
      },
      {} as Record<string, IVote[]>,
    );
  },
  groupVotesByProposalId: (votes: IVote[] = []): Record<number, IVote[]> => {
    return votes.reduce(
      (acc, vote) => {
        if (!acc[vote.proposalId]) {
          acc[vote.proposalId] = [];
        }
        acc[vote.proposalId].push(vote);
        return acc;
      },
      {} as Record<number, IVote[]>,
    );
  },
  getVoteResultOfItem: (params: IVoteResultOfItemParams): IVoteResultOfItem => {
    const { proposalId, votesOfProposal = [], key, userId } = params;

    const votesOfKeyInProposalMap =
      ProposalVoteUtils.groupVotesByKey(votesOfProposal);

    const isUserVotedInItem = userId
      ? votesOfKeyInProposalMap[key]?.some(
          (vote) => vote.creator?.userId === userId,
        )
      : false;

    const getItemPoints = (key: string): number => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      return votesOfKey.reduce(
        (acc, vote) => acc + Number(vote.weight || 0),
        0,
      );
    };

    const itemVotedMemberCount = votesOfKeyInProposalMap[key]?.length || 0;
    const itemPoints = getItemPoints(key);
    const itemPointsNeeded = ItemWeightMap[key] || 0;
    const isItemReachPointsNeeded = itemPoints >= itemPointsNeeded;
    const isItemReachQuorum = itemVotedMemberCount >= (ItemQuorumMap[key] || 0);
    const isItemValidated = isItemReachQuorum && isItemReachPointsNeeded;

    return {
      key,
      proposalId,
      itemVotedMemberCount,
      itemPoints,
      itemPointsNeeded,
      isItemReachPointsNeeded,
      isItemReachQuorum,
      isItemValidated,
      isUserVotedInItem,
    };
  },
  getVoteResultOfProposal: (
    params: IGetVoteResultOfProposalParams,
  ): IVoteResultOfProposal => {
    const { proposalId, votesOfProposal = [], userId } = params;

    const isUserVotedInProposal = userId
      ? votesOfProposal.some((vote) => vote.creator?.userId === userId)
      : false;

    const votesOfKeyInProposalMap =
      ProposalVoteUtils.groupVotesByKey(votesOfProposal);

    const totalValidPointsOfProposal = Object.entries(
      votesOfKeyInProposalMap,
    ).reduce((acc, [key, votes]) => {
      const itemPointsNeeded = ItemWeightMap[key as EssentialItemKeys] || 0;
      const totalVotesWeightForKey = votes.reduce(
        (sum, vote) => sum + Number(vote.weight || 0),
        0,
      );
      const validPointsForKey = Math.min(
        totalVotesWeightForKey,
        itemPointsNeeded,
      );
      return acc + validPointsForKey;
    }, 0);

    const userWeightMap = votesOfProposal.reduce(
      (acc, vote) => {
        const userId = vote.creator.userId;
        // use vote.weight, not creator.weight, because vote.weight is the snapshotted weight of the user when he voted
        const userWeight = Number(vote.weight || 0);

        acc[userId] = Math.max(acc[userId] || 0, userWeight);
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalSupportedUserWeightOfProposal = Object.values(
      userWeightMap,
    ).reduce((sum, weight) => sum + weight, 0);

    const totalValidQuorumOfProposal = Object.entries(
      votesOfKeyInProposalMap,
    ).reduce((acc, [key, votes]) => {
      const quorum = ItemQuorumMap[key as EssentialItemKeys] || 0;
      return acc + Math.min(votes.length, quorum);
    }, 0);

    const percentageOfPointsNeededOfProposal =
      totalValidPointsOfProposal / TotalEssentialItemWeightSum;

    const percentageOfQuorumOfProposal =
      totalValidQuorumOfProposal / TotalEssentialItemQuorumSum;

    const percentageOfProposal =
      (percentageOfPointsNeededOfProposal + percentageOfQuorumOfProposal) / 2;

    const formattedPercentageOfProposal = `${Math.round(percentageOfProposal * 100)}%`;

    const isProposalValidated =
      totalValidPointsOfProposal >= TotalEssentialItemWeightSum &&
      totalValidQuorumOfProposal >= TotalEssentialItemQuorumSum;

    return {
      proposalId,
      votesOfKeyInProposalMap,
      totalValidPointsOfProposal,
      totalSupportedUserWeightOfProposal,
      totalValidQuorumOfProposal,
      TotalEssentialItemWeightSum,
      TotalEssentialItemQuorumSum,
      percentageOfProposal,
      formattedPercentageOfProposal,
      isProposalValidated,
      isUserVotedInProposal,
    };
  },
  getVoteResultOfProject: (
    params: IGetVoteResultOfProjectParams,
  ): IVoteResultOfProject => {
    const { projectId, proposals = [], votesOfProject = [], userId } = params;

    const votesOfProposalMap =
      ProposalVoteUtils.groupVotesByProposalId(votesOfProject);

    const voteResultOfProposalMap = (proposals || []).reduce(
      (acc: Record<number, IVoteResultOfProposal>, proposal: IProposal) => {
        acc[proposal.id] = ProposalVoteUtils.getVoteResultOfProposal({
          proposalId: proposal.id,
          votesOfProposal: votesOfProposalMap[proposal.id] || [],
          userId,
        });
        return acc;
      },
      {} as Record<number, IVoteResultOfProposal>,
    );

    let leadingProposalId: number | undefined = undefined;
    let maxPercentage = -1;
    let canBePublished = false;

    for (const proposalIdStr of Object.keys(voteResultOfProposalMap)) {
      const currentProposalId = Number(proposalIdStr);
      const result = voteResultOfProposalMap[currentProposalId];

      if (
        result.percentageOfProposal > 0 &&
        result.percentageOfProposal > maxPercentage
      ) {
        maxPercentage = result.percentageOfProposal;
        leadingProposalId = currentProposalId;
      }

      if (result.isProposalValidated) {
        canBePublished = true;
      }
    }

    const leadingProposal =
      leadingProposalId !== undefined
        ? proposals.find((p) => p.id === leadingProposalId)
        : undefined;

    const leadingProposalResult =
      leadingProposalId !== undefined
        ? voteResultOfProposalMap[leadingProposalId]
        : DefaultProposalResult;

    return {
      projectId,
      votesOfProposalMap,
      voteResultOfProposalMap,
      leadingProposalId,
      leadingProposal,
      leadingProposalResult,
      canBePublished,
    };
  },
};

export default ProposalVoteUtils;
