'use client';

import { useCallback, useMemo, useState } from 'react';

import { addToast } from '@/components/base';
import UpvoteModal from '@/components/biz/modal/upvote/UpvoteModal';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

export type UpvoteActionResultType = 'like' | 'update' | 'withdraw';

export interface UpvoteActionResult {
  projectId: number;
  previousWeight: number;
  newWeight: number;
  type: UpvoteActionResultType;
}

interface UseUpvoteOptions {
  onSuccess?: (result: UpvoteActionResult) => void | Promise<void>;
}

export function useUpvote(options: UseUpvoteOptions = {}) {
  const { profile, showAuthPrompt } = useAuth();
  const { onSuccess } = options;

  const [upvoteModalOpen, setUpvoteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  // Get user's available weight
  const { data: userWeightData, refetch: refetchUserAvailableWeight } =
    trpc.likeProject.getUserAvailableWeight.useQuery(undefined, {
      enabled: !!profile,
      refetchOnWindowFocus: false,
      staleTime: 0,
    });

  // Get user's like records for all projects
  const { data: userLikeRecords, refetch: refetchUserVotedProjects } =
    trpc.active.getUserVotedProjects.useQuery(
      { userId: profile?.userId || '', limit: 100 },
      {
        enabled: !!profile?.userId,
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    );

  // Create a map for efficient projectLikeRecord lookup
  const projectLikeRecordMap = useMemo(() => {
    const map = new Map();
    if (userLikeRecords?.items) {
      userLikeRecords.items.forEach((record) => {
        if (record.project?.id) {
          map.set(record.project.id, record);
        }
      });
    }
    return map;
  }, [userLikeRecords]);

  // Like project mutation
  const likeProjectMutation = trpc.likeProject.likeProject.useMutation({
    onSuccess: async (_data, variables) => {
      const previousWeight =
        projectLikeRecordMap.get(variables.projectId)?.weight || 0;
      await Promise.all([
        onSuccess?.({
          projectId: variables.projectId,
          previousWeight,
          newWeight: variables.weight,
          type: 'like',
        }),
        refetchUserVotedProjects(),
        refetchUserAvailableWeight(),
      ]);
      setUpvoteModalOpen(false);
      setSelectedProjectId(null);
      addToast({
        title: 'Success',
        description: 'Project Upvoted Successfully',
        color: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to upvote project',
        color: 'danger',
      });
    },
  });

  const updateLikeProjectMutation =
    trpc.likeProject.updateLikeProject.useMutation({
      onSuccess: async (_data, variables) => {
        const previousWeight =
          projectLikeRecordMap.get(variables.projectId)?.weight || 0;
        await Promise.all([
          onSuccess?.({
            projectId: variables.projectId,
            previousWeight,
            newWeight: variables.weight,
            type: 'update',
          }),
          refetchUserVotedProjects(),
          refetchUserAvailableWeight(),
        ]);
        setUpvoteModalOpen(false);
        setSelectedProjectId(null);
        addToast({
          title: 'Success',
          description: 'Project Updated Successfully',
          color: 'success',
        });
      },
      onError: (error) => {
        addToast({
          title: 'Error',
          description: error.message || 'Failed to update vote',
          color: 'danger',
        });
      },
    });

  const withdrawLikeMutation = trpc.likeProject.withdrawLike.useMutation({
    onSuccess: async (_data, variables) => {
      const previousWeight =
        projectLikeRecordMap.get(variables.projectId)?.weight || 0;
      await Promise.all([
        onSuccess?.({
          projectId: variables.projectId,
          previousWeight,
          newWeight: 0,
          type: 'withdraw',
        }),
        refetchUserVotedProjects(),
        refetchUserAvailableWeight(),
      ]);
      setUpvoteModalOpen(false);
      setSelectedProjectId(null);
      addToast({
        title: 'Success',
        description: 'CP Withdrawn Successfully',
        color: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to withdraw CP',
        color: 'danger',
      });
    },
  });

  const handleUpvote = useCallback(
    (projectId: number) => {
      if (!profile) {
        showAuthPrompt();
        return;
      }
      setSelectedProjectId(projectId);
      setUpvoteModalOpen(true);
    },
    [profile, showAuthPrompt],
  );

  const handleConfirmUpvote = useCallback(
    async (weight: number) => {
      if (!selectedProjectId) return;

      const hasUserUpvoted = !!projectLikeRecordMap.get(selectedProjectId);

      if (hasUserUpvoted) {
        await updateLikeProjectMutation.mutateAsync({
          projectId: selectedProjectId,
          weight,
        });
      } else {
        await likeProjectMutation.mutateAsync({
          projectId: selectedProjectId,
          weight,
        });
      }
    },
    [
      selectedProjectId,
      likeProjectMutation,
      updateLikeProjectMutation,
      projectLikeRecordMap,
    ],
  );

  const handleWithdraw = useCallback(async () => {
    if (!selectedProjectId) return;

    await withdrawLikeMutation.mutateAsync({
      projectId: selectedProjectId,
    });
  }, [selectedProjectId, withdrawLikeMutation]);

  const userLikeRecord = useMemo(() => {
    return selectedProjectId
      ? projectLikeRecordMap.get(selectedProjectId)
      : null;
  }, [selectedProjectId, projectLikeRecordMap]);

  const getProjectLikeRecord = useCallback(
    (projectId: number) => {
      return projectLikeRecordMap.get(projectId);
    },
    [projectLikeRecordMap],
  );

  const isLoading =
    likeProjectMutation.isPending ||
    updateLikeProjectMutation.isPending ||
    withdrawLikeMutation.isPending;

  // UpvoteModal component with all necessary props
  const UpvoteModalComponent = useMemo(
    () => (
      <UpvoteModal
        isOpen={upvoteModalOpen}
        onClose={() => {
          setUpvoteModalOpen(false);
          setSelectedProjectId(null);
        }}
        onConfirm={handleConfirmUpvote}
        onWithdraw={handleWithdraw}
        availableCP={userWeightData?.availableWeight || 0}
        currentUserWeight={userLikeRecord?.weight || 0}
        hasUserUpvoted={!!userLikeRecord}
        isConfirmLoading={
          likeProjectMutation.isPending || updateLikeProjectMutation.isPending
        }
        isWithdrawLoading={withdrawLikeMutation.isPending}
      />
    ),
    [
      upvoteModalOpen,
      handleConfirmUpvote,
      handleWithdraw,
      userWeightData?.availableWeight,
      userLikeRecord,
      likeProjectMutation.isPending,
      updateLikeProjectMutation.isPending,
      withdrawLikeMutation.isPending,
    ],
  );

  return {
    // Actions
    handleUpvote,

    // Data
    projectLikeRecordMap,
    getProjectLikeRecord,
    userWeightData,

    // State
    isLoading,

    // Components
    UpvoteModalComponent,

    // For external refetching
    refetchUserVotedProjects,
    refetchUserAvailableWeight,
  };
}
