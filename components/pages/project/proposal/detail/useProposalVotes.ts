import { useCallback, useMemo, useRef, useState } from 'react';

import { addToast } from '@/components/base';
import { ITableProposalItem } from '@/components/pages/project/proposal/detail/ProposalDetails';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProposal, IVote } from '@/types';
import { devLog } from '@/utils/devLog';
import ProposalVoteUtils from '@/utils/proposal';

type VoteArrayType = IVote[] | undefined;
const ONE_MINUTE_MS = 60 * 1000;

export function useProposalVotes(
  proposal: IProposal | undefined,
  projectId: number,
  proposals?: IProposal[],
) {
  const { profile } = useAuth();
  const [inActionKeys, setInActionKeys] = useState<Record<string, boolean>>({});
  // 用于跟踪每个key的操作状态，防止重复操作
  const operationInProgress = useRef<Record<string, boolean>>({});

  const proposalQueryOptions = useMemo(
    () => ({
      enabled: !!proposal && !!proposal.id,
      select: (data: VoteArrayType) => {
        devLog('getVotesByProposalId', data);
        return data;
      },
    }),
    [proposal],
  );

  const projectQueryOptions = useMemo(
    () => ({
      enabled: !!projectId,
      select: (data: VoteArrayType) => {
        devLog('getVotesByProjectId', data);
        return data;
      },
    }),
    [projectId],
  );

  const {
    data: votesOfProposal,
    isFetching: isVotesOfProposalFetching,
    refetch: refetchVotesOfProposal,
  } = trpc.vote.getVotesByProposalId.useQuery(
    { proposalId: Number(proposal?.id) },
    proposalQueryOptions,
  );

  const {
    data: votesOfProject,
    isFetching: isVotesOfProjectFetching,
    refetch: refetchVotesOfProject,
  } = trpc.vote.getVotesByProjectId.useQuery(
    { projectId: Number(projectId) },
    projectQueryOptions,
  );

  const voteResultOfProposal = useMemo(() => {
    return ProposalVoteUtils.getVoteResultOfProposal({
      proposalId: Number(proposal?.id),
      votesOfProposal: votesOfProposal || [],
      userId: profile?.userId,
    });
  }, [votesOfProposal, proposal, profile]);

  const getItemVoteResult = useCallback(
    (key: string) => {
      return ProposalVoteUtils.getVoteResultOfItem({
        proposalId: Number(proposal?.id),
        votesOfProposal: votesOfProposal || [],
        key,
        userId: profile?.userId,
      });
    },
    [votesOfProposal, proposal, profile],
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

  const isUserVotedItemOfProposal = useCallback(
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

  const isUserVotedItemOfProject = useCallback(
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

  const setKeyActive = useCallback((key: string, active: boolean) => {
    operationInProgress.current[key] = active;

    setInActionKeys((pre) => ({
      ...pre,
      [key]: active,
    }));
  }, []);

  const refetchVoteData = useCallback(async () => {
    try {
      await Promise.all([refetchVotesOfProposal(), refetchVotesOfProject()]);
    } catch (err) {
      console.error(err);
    }
  }, [refetchVotesOfProposal, refetchVotesOfProject]);

  const onCreateVote = useCallback(
    async (key: string) => {
      if (!proposal) return;
      if (!profile) return;

      if (operationInProgress.current[key]) {
        devLog('onCreateVote already in progress for key:', key);
        return;
      }

      setKeyActive(key, true);
      const payload = { proposalId: proposal.id, key };
      devLog('onCreateVote payload', payload);

      try {
        await createVoteMutation.mutateAsync(payload);
        devLog('onCreateVote success', payload);
        await refetchVoteData();
      } catch (error) {
        devLog('onVote error', error);
        addToast({
          title: 'Vote Failed',
          description: (error as Error)?.message || 'Unknown error',
          color: 'danger',
        });
      } finally {
        setKeyActive(key, false);
      }
    },
    [profile, proposal, createVoteMutation, refetchVoteData, setKeyActive],
  );

  const onSwitchVote = useCallback(
    async (key: string) => {
      if (!proposal) return;
      if (!profile) return;

      if (operationInProgress.current[key]) {
        devLog('onSwitchVote already in progress for key:', key);
        return;
      }

      setKeyActive(key, true);
      const payload = { proposalId: proposal.id, key };
      devLog('onSwitchVote payload', payload);

      try {
        await switchVoteMutation.mutateAsync(payload);
        await refetchVoteData();
      } catch (error) {
        addToast({
          title: 'Switch Vote Failed',
          description: (error as Error)?.message || 'Unknown error',
          color: 'danger',
        });
      } finally {
        setKeyActive(key, false);
      }
    },
    [profile, proposal, switchVoteMutation, refetchVoteData, setKeyActive],
  );

  const onCancelVote = useCallback(async (id: number, key: string) => {
    devLog('can not cancel vote', id, key);
  }, []);

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
        setSourceProposalInfo: (
          proposal: IProposal | null,
          index: number,
        ) => void;
      },
    ) => {
      const {
        setCurrentVoteItem,
        setIsCancelModalOpen,
        setIsSwitchModalOpen,
        setSourceProposalInfo,
      } = callbacks;

      setCurrentVoteItem(item);
      if (!isUserVotedItemOfProject(item.key)) {
        await onCreateVote(item.key);
        return;
      }
      if (isUserVotedItemOfProposal(item.key)) {
        console.warn('Can not cancel vote');
        return;
        // if (doNotShowCancelModal) {
        //   await onCancelVote(userVotesOfProposalMap[item.key].id, item.key);
        // } else {
        //   setIsCancelModalOpen(true);
        // }
        // return;
      }

      if (
        isUserVotedItemOfProject(item.key) &&
        !isUserVotedItemOfProposal(item.key)
      ) {
        const sourceProposalData = findSourceProposal(item.key);
        const sourceProposalIndex = proposals?.findIndex(
          (p) => p.id === sourceProposalData?.id,
        );
        setSourceProposalInfo(sourceProposalData, sourceProposalIndex || 0);
        setIsSwitchModalOpen(true);
      }
    },
    [
      proposals,
      isUserVotedItemOfProject,
      isUserVotedItemOfProposal,
      onCreateVote,
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
    voteResultOfProposal,
    getItemVoteResult,
    isUserVotedInProposal: isUserVotedItemOfProposal,
    isUserVotedInProject: isUserVotedItemOfProject,
    isFetchVoteInfoLoading:
      isVotesOfProposalFetching || isVotesOfProjectFetching,
    isVoteActionPending:
      createVoteMutation.isPending || switchVoteMutation.isPending,
    createVoteMutation,
    switchVoteMutation,
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
