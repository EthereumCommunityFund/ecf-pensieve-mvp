'use client';

import { useCallback, useMemo, useState } from 'react';

import { addToast } from '@/components/base';
import UpvoteModal from '@/components/biz/modal/upvote/UpvoteModal';
import ProjectCard from '@/components/pages/project/ProjectCard';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

export interface IProjectListWithUpvoteProps {
  projectList: IProject[];
  onRefetch?: () => void;
}

const ProjectListWithUpvote = (props: IProjectListWithUpvoteProps) => {
  const { projectList, onRefetch } = props;
  const { profile, showAuthPrompt } = useAuth();

  const [upvoteModalOpen, setUpvoteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const len = projectList.length;

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
    onSuccess: async () => {
      onRefetch?.();
      refetchUserVotedProjects();
      refetchUserAvailableWeight();
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
      onSuccess: async () => {
        await Promise.all([
          onRefetch?.(),
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
    onSuccess: async () => {
      onRefetch?.();
      refetchUserVotedProjects();
      refetchUserAvailableWeight();
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

  return (
    <>
      <div className="mt-2.5 px-[10px]">
        {projectList.map((project, idx) => {
          const projectLikeRecord = projectLikeRecordMap.get(project.id);

          return (
            <ProjectCard
              key={project.id}
              project={project}
              showBorder={idx !== len - 1}
              onUpvote={handleUpvote}
              userLikeRecord={
                projectLikeRecord
                  ? {
                      id: project.id,
                      weight: projectLikeRecord.weight || 0,
                    }
                  : null
              }
            />
          );
        })}
      </div>

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
    </>
  );
};

export default ProjectListWithUpvote;
