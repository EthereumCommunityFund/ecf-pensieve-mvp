import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { ITableProposalItem } from '@/components/pages/project/proposal/detail/ProposalDetails';
import {
  DefaultVoteQuorum,
  ItemQuorumMap,
  ItemWeightMap,
  TotalEssentialItemQuorumSum,
  TotalEssentialItemWeightSum,
} from '@/constants/proposal';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProposal, IVote } from '@/types';
import { devLog } from '@/utils/devLog';

export function useProposalVotes(
  proposal: IProposal | undefined,
  projectId: number,
  proposals?: IProposal[],
) {
  const { isConnected } = useAccount();
  const { profile } = useAuth();
  const [inActionKeys, setInActionKeys] = useState<Record<string, boolean>>({});

  const {
    data: votesOfProposal,
    isLoading: isVotesOfProposalLoading,
    isFetched: isVotesOfProposalFetched,
    isFetching: isVotesOfProposalFetching,
    refetch: refetchVotesOfProposal,
  } = trpc.vote.getVotesByProposalId.useQuery(
    { proposalId: Number(proposal?.id) },
    {
      enabled: !!proposal && !!proposal.id,
      select: (data) => {
        devLog('getVotesByProposalId', data);
        return data;
      },
    },
  );

  const {
    data: votesOfProject,
    isLoading: isVotesOfProjectLoading,
    isFetched: isVotesOfProjectFetched,
    isFetching: isVotesOfProjectFetching,
    refetch: refetchVotesOfProject,
  } = trpc.vote.getVotesByProjectId.useQuery(
    { projectId: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        // devLog('getVotesByProjectId', data);
        return data;
      },
    },
  );

  const votesOfKeyInProposalMap = useMemo(() => {
    return (votesOfProposal || []).reduce(
      (acc, vote) => {
        if (!acc[vote.key]) {
          acc[vote.key] = [];
        }
        acc[vote.key].push(vote);
        return acc;
      },
      {} as Record<string, IVote[]>,
    );
  }, [votesOfProposal]);

  const votedOfKeyInProjectMap = useMemo(() => {
    return (votesOfProject || []).reduce(
      (acc, vote) => {
        if (!acc[vote.key]) {
          acc[vote.key] = [];
        }
        acc[vote.key].push(vote);
        return acc;
      },
      {} as Record<string, IVote[]>,
    );
  }, [votesOfProject]);

  const userVotesOfProposalMap = useMemo(() => {
    if (!profile) return {};
    return (votesOfProposal || [])
      .filter((vote) => vote.creator?.userId === profile?.userId)
      .reduce(
        (acc, vote) => {
          acc[vote.key] = vote;
          return acc;
        },
        {} as Record<string, IVote>,
      );
  }, [votesOfProposal, profile]);

  const userVotesOfProjectMap = useMemo(() => {
    if (!profile) return {};
    return (votesOfProject || [])
      .filter((vote) => vote.creator?.userId === profile?.userId)
      .reduce(
        (acc, vote) => {
          acc[vote.key] = vote;
          return acc;
        },
        {} as Record<string, IVote>,
      );
  }, [votesOfProject, profile]);

  const totalValidPointsOfProposal = useMemo(() => {
    return (votesOfProposal || []).reduce((acc, vote) => {
      const weight = Number(vote.weight);
      const itemPointsNeeded = ItemWeightMap[vote.key];
      const shouldAddPoints =
        weight >= itemPointsNeeded ? itemPointsNeeded : weight;
      return acc + shouldAddPoints;
    }, 0);
  }, [votesOfProposal]);

  const totalSupportedUserWeightOfProposal = useMemo(() => {
    const userWeightMap = (votesOfProposal || []).reduce(
      (acc, vote) => {
        const creator = vote.creator!;
        const userWeight = Number(creator.weight);
        acc = {
          ...acc,
          [creator.address]: Math.max(acc[creator.address] || 0, userWeight),
        };
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.values(userWeightMap).reduce(
      (acc, weight) => acc + weight,
      0,
    );
  }, [votesOfProposal]);

  const totalValidQuorumOfProposal = useMemo(() => {
    return Object.keys(votesOfKeyInProposalMap).reduce((acc, key) => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      const quorum = ItemQuorumMap[key];
      return acc + (votesOfKey.length >= quorum ? quorum : votesOfKey.length);
    }, 0);
  }, [votesOfKeyInProposalMap]);

  const percentageOfPointsNeededOfProposal = useMemo(() => {
    return totalValidPointsOfProposal / TotalEssentialItemWeightSum;
  }, [totalValidPointsOfProposal]);

  const percentageOfQuorumOfProposal = useMemo(() => {
    return totalValidQuorumOfProposal / TotalEssentialItemQuorumSum;
  }, [totalValidQuorumOfProposal]);

  const percentageOfProposal = useMemo(() => {
    return (
      (percentageOfPointsNeededOfProposal + percentageOfQuorumOfProposal) / 2
    );
  }, [percentageOfPointsNeededOfProposal, percentageOfQuorumOfProposal]);

  const getItemPointsNeeded = useCallback((key: string) => {
    return ItemWeightMap[key];
  }, []);

  const getItemPoints = useCallback(
    (key: string) => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      return votesOfKey.reduce((acc, vote) => acc + Number(vote.weight), 0);
    },
    [votesOfKeyInProposalMap],
  );

  const getItemVotedMemberCount = useCallback(
    (key: string) => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      return votesOfKey.length;
    },
    [votesOfKeyInProposalMap],
  );

  const isItemReachQuorum = useCallback(
    (key: string) => {
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      return votesOfKey.length >= DefaultVoteQuorum;
    },
    [votesOfKeyInProposalMap],
  );

  const isItemReachPointsNeeded = useCallback(
    (key: string) => {
      const pointsNeeded = ItemWeightMap[key];
      const currentPoints = getItemPoints(key);
      return currentPoints >= pointsNeeded;
    },
    [getItemPoints],
  );

  const isItemValidated = useCallback(
    (key: string) => {
      return isItemReachQuorum(key) && isItemReachPointsNeeded(key);
    },
    [isItemReachQuorum, isItemReachPointsNeeded],
  );

  const isUserVotedInProposal = useCallback(
    (key: string) => {
      if (!profile) return false;
      const votesOfKey = votesOfKeyInProposalMap[key] || [];
      if (!votesOfKey || votesOfKey.length === 0) return false;
      const isUserVoted = votesOfKey?.find(
        (vote) => vote.creator?.userId === profile?.userId,
      );
      return !!isUserVoted;
    },
    [profile, votesOfKeyInProposalMap],
  );

  const isUserVotedInProject = useCallback(
    (key: string) => {
      if (!profile) return false;
      const votesOfKey = votedOfKeyInProjectMap[key] || [];
      if (!votesOfKey || votesOfKey.length === 0) return false;
      const isUserVoted = votesOfKey?.find(
        (vote) => vote.creator?.userId === profile?.userId,
      );
      return !!isUserVoted;
    },
    [profile, votedOfKeyInProjectMap],
  );

  const createVoteMutation = trpc.vote.createVote.useMutation();
  const switchVoteMutation = trpc.vote.switchVote.useMutation();
  const cancelVoteMutation = trpc.vote.cancelVote.useMutation();

  const setKeyActive = (key: string, active: boolean) => {
    setInActionKeys((pre) => ({
      ...pre,
      [key]: active,
    }));
  };

  const onCreateVote = useCallback(
    async (key: string) => {
      if (!proposal) return;
      if (!profile) return;
      setKeyActive(key, true);
      const payload = { proposalId: proposal.id, key };
      createVoteMutation.mutate(payload, {
        onSuccess: async (data) => {
          await Promise.all([
            refetchVotesOfProposal(),
            refetchVotesOfProject(),
          ]);
          setKeyActive(key, false);
        },
        onError: (error) => {
          setKeyActive(key, false);
          devLog('onVote error', error);
        },
      });
    },
    [
      profile,
      proposal,
      createVoteMutation,
      refetchVotesOfProposal,
      refetchVotesOfProject,
    ],
  );

  const onSwitchVote = useCallback(
    async (key: string) => {
      if (!proposal) return;
      if (!profile) return;
      setKeyActive(key, true);
      const payload = { proposalId: proposal.id, key };
      switchVoteMutation.mutate(payload, {
        onSuccess: async (data) => {
          await Promise.all([
            refetchVotesOfProposal(),
            refetchVotesOfProject(),
          ]);
          setKeyActive(key, false);
        },
        onError: (error) => {
          setKeyActive(key, false);
          // devLog('onSwitchVote error', error);
        },
      });
    },
    [
      profile,
      proposal,
      switchVoteMutation,
      refetchVotesOfProposal,
      refetchVotesOfProject,
    ],
  );

  const onCancelVote = useCallback(
    async (id: number, key: string) => {
      if (!profile) return;
      setKeyActive(key, true);
      cancelVoteMutation.mutate(
        { id },
        {
          onSuccess: async (data) => {
            await Promise.all([
              refetchVotesOfProposal(),
              refetchVotesOfProject(),
            ]);
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            // devLog('onCancelVote error', error);
          },
        },
      );
    },
    [
      profile,
      cancelVoteMutation,
      refetchVotesOfProposal,
      refetchVotesOfProject,
    ],
  );

  const findSourceProposal = useCallback(
    (key: string): IProposal | null => {
      if (!proposals || !userVotesOfProjectMap[key]) return null;
      const sourceVote = userVotesOfProjectMap[key];
      return proposals.find((p) => p.id === sourceVote.proposalId) || null;
    },
    [proposals, userVotesOfProjectMap],
  );

  const handleVoteAction = useCallback(
    async (
      item: ITableProposalItem,
      doNotShowCancelModal: boolean,
      callbacks: {
        setCurrentVoteItem: (item: ITableProposalItem) => void;
        setIsCancelModalOpen: (open: boolean) => void;
        setIsSwitchModalOpen: (open: boolean) => void;
        setSourceProposal: (proposal: IProposal | null) => void;
      },
    ) => {
      devLog('onVoteAction item', item);
      const {
        setCurrentVoteItem,
        setIsCancelModalOpen,
        setIsSwitchModalOpen,
        setSourceProposal,
      } = callbacks;

      setCurrentVoteItem(item);
      if (!isUserVotedInProject(item.key)) {
        await onCreateVote(item.key);
        return;
      }
      if (isUserVotedInProposal(item.key)) {
        if (doNotShowCancelModal) {
          await onCancelVote(userVotesOfProposalMap[item.key].id, item.key);
        } else {
          setIsCancelModalOpen(true);
        }
        return;
      }

      if (isUserVotedInProject(item.key) && !isUserVotedInProposal(item.key)) {
        const sourceProposalData = findSourceProposal(item.key);
        setSourceProposal(sourceProposalData);
        setIsSwitchModalOpen(true);
      }
    },
    [
      isUserVotedInProject,
      isUserVotedInProposal,
      onCreateVote,
      onCancelVote,
      userVotesOfProposalMap,
      findSourceProposal,
    ],
  );

  return {
    votesOfProposal,
    votesOfProject,
    votesOfKeyInProposalMap,
    votedOfKeyInProjectMap,
    userVotesOfProposalMap,
    userVotesOfProjectMap,
    totalValidPointsOfProposal,
    totalSupportedUserWeightOfProposal,
    totalValidQuorumOfProposal,
    percentageOfProposal,
    isUserVotedInProposal,
    isUserVotedInProject,
    getItemPointsNeeded,
    getItemPoints,
    getItemVotedMemberCount,
    isItemReachQuorum,
    isItemReachPointsNeeded,
    isItemValidated,
    isFetchVoteInfoLoading:
      isVotesOfProposalFetching || isVotesOfProjectFetching,
    isVoteActionPending:
      createVoteMutation.isPending ||
      switchVoteMutation.isPending ||
      cancelVoteMutation.isPending,
    createVoteMutation,
    switchVoteMutation,
    cancelVoteMutation,
    inActionKeys,
    onCreateVote,
    onSwitchVote,
    onCancelVote,
    handleVoteAction,
    findSourceProposal,
    refetchVotesOfProposal,
    refetchVotesOfProject,
  };
}
