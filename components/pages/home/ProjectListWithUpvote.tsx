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
    });

  // Get user's like records for all projects
  const { data: userLikeRecords, refetch: refetchUserVotedProjects } =
    trpc.active.getUserVotedProjects.useQuery(
      { userId: profile?.userId || '', limit: 100 },
      { enabled: !!profile?.userId },
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
    onSuccess: () => {
      setUpvoteModalOpen(false);
      setSelectedProjectId(null);
      onRefetch?.();
      refetchUserVotedProjects();
      refetchUserAvailableWeight();
      addToast({
        title: 'Success',
        description: 'Project Upvoted Successfully',
        color: 'success',
      });
    },
  });

  const updateLikeProjectMutation =
    trpc.likeProject.updateLikeProject.useMutation({
      onSuccess: () => {
        setUpvoteModalOpen(false);
        setSelectedProjectId(null);
        onRefetch?.();
        refetchUserVotedProjects();
        refetchUserAvailableWeight();
        addToast({
          title: 'Success',
          description: 'Project Updated Successfully',
          color: 'success',
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

  const selectedProject = projectList.find((p) => p.id === selectedProjectId);
  const userLikeRecord = selectedProjectId
    ? projectLikeRecordMap.get(selectedProjectId)
    : null;

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
        availableCP={
          (userWeightData?.availableWeight || 0) +
          (userLikeRecord ? userLikeRecord.weight || 0 : 0)
        }
        currentUserWeight={userLikeRecord?.weight || 0}
        hasUserUpvoted={!!userLikeRecord}
        isLoading={
          likeProjectMutation.isPending || updateLikeProjectMutation.isPending
        }
      />
    </>
  );
};

export default ProjectListWithUpvote;
