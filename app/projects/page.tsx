'use client';

import { Image } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { addToast } from '@/components/base';
import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import UpvoteModal from '@/components/biz/modal/upvote/UpvoteModal';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import RewardCard from '@/components/pages/project/RewardCardEntry';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const ProjectsPage = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();

  const [upvoteModalOpen, setUpvoteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch: refetchProjects,
  } = trpc.project.getProjects.useInfiniteQuery(
    {
      limit: 10,
      isPublished: true,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const handleLoadMore = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleProposeProject = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  }, [profile, showAuthPrompt, router]);

  const { data: userWeightData, refetch: refetchUserAvailableWeight } =
    trpc.likeProject.getUserAvailableWeight.useQuery(undefined, {
      enabled: !!profile?.userId,
    });

  const { data: userLikeRecords, refetch: refetchUserVotedProjects } =
    trpc.active.getUserVotedProjects.useQuery(
      { userId: profile?.userId || '', limit: 100 },
      { enabled: !!profile?.userId },
    );

  const likeProjectMutation = trpc.likeProject.likeProject.useMutation({
    onSuccess: async () => {
      setUpvoteModalOpen(false);
      setSelectedProjectId(null);
      refetchProjects();
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
      onSuccess: async () => {
        setUpvoteModalOpen(false);
        setSelectedProjectId(null);
        refetchProjects();
        refetchUserVotedProjects();
        refetchUserAvailableWeight();
        addToast({
          title: 'Success',
          description: 'Project Updated Successfully',
          color: 'success',
        });
      },
    });

  const allProjects = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

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

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId);
  const userLikeRecord = selectedProjectId
    ? projectLikeRecordMap.get(selectedProjectId)
    : null;

  useEffect(() => {
    if (allProjects.length > 0) {
      devLog('allProjects', allProjects);
    }
  }, [allProjects]);

  return (
    <div className="pb-10">
      <div className="flex w-full items-start justify-start gap-5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <Image
          src="/images/projects/logo.png"
          alt="ECF project Logo"
          width={63}
          height={63}
        />
        <div className="flex-1">
          <ECFTypography type={'title'}>Projects</ECFTypography>
          <ECFTypography type={'subtitle2'} className="mt-2.5">
            Explore projects and initiatives here or add your own to the list!
          </ECFTypography>
          <ECFButton onPress={handleProposeProject} className="mt-2.5">
            Propose a Project
          </ECFButton>
        </div>
      </div>

      <div className="mobile:flex-col mobile:gap-5 mt-5 flex items-start justify-between gap-10 px-2.5">
        {/* <div className="pc:hidden tablet:hidden flex w-full items-center justify-end gap-2.5 lg:hidden">
          <ECFButton $size="small">Sort</ECFButton>
          <ECFButton $size="small">Filter</ECFButton>
        </div> */}

        <div className="w-full flex-1">
          <div className="border-b border-black/10 px-2.5 py-2 opacity-80">
            <ECFTypography type={'subtitle1'}>Recent Projects</ECFTypography>
            {/* <ECFTypography type={'body2'} className="mt-[5px]">
              Page Completion Rate (Transparency) * User Supported Votes
            </ECFTypography> */}
          </div>

          {/* Project list */}
          <div className="pb-2.5">
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} showBorder={true} />
                ))}
              </>
            ) : allProjects.length > 0 ? (
              <>
                {allProjects.map((project) => {
                  const projectLikeRecord = projectLikeRecordMap.get(
                    project.id,
                  );

                  return (
                    <ProjectCard
                      key={project.id}
                      project={project as IProject}
                      showBorder={true}
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

                {isFetchingNextPage && (
                  <ProjectCardSkeleton showBorder={true} />
                )}

                {hasNextPage && (
                  <div className="flex justify-center py-4">
                    <ECFButton
                      onPress={handleLoadMore}
                      isDisabled={isFetchingNextPage}
                      $size="small"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </ECFButton>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center py-[80px]">
                <ECFTypography type="subtitle1">
                  No Published Project Yet
                </ECFTypography>
              </div>
            )}
          </div>
        </div>

        <div className="mobile:hidden">
          {/* <div className="flex h-[73px] w-[300px] items-start justify-start gap-5">
            <ECFButton $size="small" className="min-w-0 px-2.5">
              Sort
            </ECFButton>
            <ECFButton $size="small" className="min-w-0 px-2.5">
              Filter
            </ECFButton>
          </div> */}

          <RewardCard />
        </div>

        <div className="pc:hidden tablet:hidden mt-5 w-full lg:hidden ">
          <RewardCard />
        </div>
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
    </div>
  );
};

export default ProjectsPage;
