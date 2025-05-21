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
}

export interface IVoteResultOfItemParams
  extends IGetVoteResultOfProposalParams {
  key: string;
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
}

export interface IGetVoteResultOfProjectParams {
  projectId: number;
  votesOfProject: IVote[];
  proposals: IProposal[];
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
  /**
   * if leadingProposalId is not set, leadingProposalResult will be the default proposal result
   */
  leadingProposalResult: IVoteResultOfProposal;
  canBePublished: boolean;
}

const ProposalVoteUtils = {
  getVoteResultOfItem: (params: IVoteResultOfItemParams): IVoteResultOfItem => {
    const { proposalId, votesOfProposal, key } = params;

    const votesOfKeyInProposalMap = (votesOfProposal || []).reduce(
      (acc, vote) => {
        if (!acc[vote.key]) {
          acc[vote.key] = [];
        }
        acc[vote.key].push(vote);
        return acc;
      },
      {} as Record<string, IVote[]>,
    );

    const getItemPoints = (key: string) => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      return votesOfKey.reduce((acc, vote) => acc + Number(vote.weight), 0);
    };

    const itemVotedMemberCount = (votesOfKeyInProposalMap[key] || []).length;
    const itemPoints = getItemPoints(key);
    const itemPointsNeeded = ItemWeightMap[key];
    const isItemReachPointsNeeded = itemPoints >= itemPointsNeeded;
    const isItemReachQuorum = itemVotedMemberCount >= ItemQuorumMap[key];
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
    };
  },
  getVoteResultOfProposal: (
    params: IGetVoteResultOfProposalParams,
  ): IVoteResultOfProposal => {
    const { proposalId, votesOfProposal } = params;

    const votesOfKeyInProposalMap = (votesOfProposal || []).reduce(
      (acc, vote) => {
        if (!acc[vote.key]) {
          acc[vote.key] = [];
        }
        acc[vote.key].push(vote);
        return acc;
      },
      {} as Record<string, IVote[]>,
    );

    const totalValidPointsOfProposal = (votesOfProposal || []).reduce(
      (acc, vote) => {
        const weight = Number(vote.weight);
        const itemPointsNeeded = ItemWeightMap[vote.key];
        const shouldAddPoints =
          weight >= itemPointsNeeded ? itemPointsNeeded : weight;
        return acc + shouldAddPoints;
      },
      0,
    );

    const userWeightMap = (votesOfProposal || []).reduce(
      (acc, vote) => {
        const creator = vote.creator!;
        const userWeight = Number(creator.weight);
        acc = {
          ...acc,
          [creator.userId]: Math.max(acc[creator.userId] || 0, userWeight),
        };
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalSupportedUserWeightOfProposal = Object.values(
      userWeightMap,
    ).reduce((acc, weight) => acc + weight, 0);

    const totalValidQuorumOfProposal = Object.keys(
      votesOfKeyInProposalMap,
    ).reduce((acc, key) => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      const quorum = ItemQuorumMap[key];
      return acc + (votesOfKey.length >= quorum ? quorum : votesOfKey.length);
    }, 0);

    const percentageOfPointsNeededOfProposal =
      totalValidPointsOfProposal / TotalEssentialItemWeightSum;

    const percentageOfQuorumOfProposal =
      totalValidQuorumOfProposal / TotalEssentialItemQuorumSum;

    const percentageOfProposal =
      (percentageOfPointsNeededOfProposal + percentageOfQuorumOfProposal) / 2;

    const formattedPercentageOfProposal = `${(percentageOfProposal * 100).toFixed(0)}%`;

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
    };
  },
  // TODO getProjects 接口, proposals -> voteRecords -> creator 的类型是userId，不是 creator
  getVoteResultOfProject: (
    params: IGetVoteResultOfProjectParams,
  ): IVoteResultOfProject => {
    const { projectId, proposals, votesOfProject } = params;

    const votesOfProposalMap = (votesOfProject || []).reduce(
      (acc: Record<number, IVote[]>, vote: IVote) => {
        acc[vote.proposalId] = [...(acc[vote.proposalId] || []), vote];
        return acc;
      },
      {} as Record<number, IVote[]>,
    );

    const voteResultOfProposalMap = (proposals || []).reduce(
      (acc: Record<number, IVoteResultOfProposal>, proposal: IProposal) => {
        acc[proposal.id] = ProposalVoteUtils.getVoteResultOfProposal({
          proposalId: proposal.id,
          votesOfProposal: votesOfProposalMap[proposal.id] || [],
        });
        return acc;
      },
      {} as Record<number, IVoteResultOfProposal>,
    );

    let leadingProposalId: number | undefined = undefined;
    let maxPercentage = -1;
    let canBePublished = false;

    const proposalIds = Object.keys(voteResultOfProposalMap);

    if (proposalIds.length > 0) {
      for (const proposalId of proposalIds) {
        const currentProposalId = Number(proposalId);
        const result = voteResultOfProposalMap[currentProposalId];
        if (result && result.percentageOfProposal > maxPercentage) {
          maxPercentage = result.percentageOfProposal;
          leadingProposalId = currentProposalId;
        }
        if (result && result.isProposalValidated) {
          canBePublished = true;
        }
      }
    }

    const defaultProposalResult: IVoteResultOfProposal = {
      proposalId: 0,
      votesOfKeyInProposalMap: {},
      totalValidPointsOfProposal: 0,
      totalSupportedUserWeightOfProposal: 0,
      totalValidQuorumOfProposal: 0,
      TotalEssentialItemWeightSum: TotalEssentialItemWeightSum,
      TotalEssentialItemQuorumSum: TotalEssentialItemQuorumSum,
      percentageOfProposal: 0,
      formattedPercentageOfProposal: '0%',
      isProposalValidated: false,
    };

    const leadingProposalResult = leadingProposalId
      ? voteResultOfProposalMap[leadingProposalId]
      : defaultProposalResult;

    return {
      projectId,
      votesOfProposalMap,
      voteResultOfProposalMap,
      leadingProposalId,
      leadingProposalResult,
      canBePublished,
    };
  },
};

export default ProposalVoteUtils;
