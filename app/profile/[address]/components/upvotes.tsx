import { useCallback, useMemo, useState } from 'react';

import { addToast, ECFButton } from '@/components/base';
import ECFTypography from '@/components/base/typography';
import UpvoteModal from '@/components/biz/modal/upvote/UpvoteModal';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

import { useProfileData } from './dataContext';

export default function Upvotes() {
  const { user } = useProfileData();
  const { profile, showAuthPrompt } = useAuth();

  const [upvoteModalOpen, setUpvoteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const {
    data: upvotesData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchUpvotedProjects,
  } = trpc.active.getUserVotedProjects.useInfiniteQuery(
    {
      userId: user?.userId ?? '',
      limit: 10,
    },
    {
      enabled: !!user?.userId,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const upvotedProjects = useMemo(() => {
    return upvotesData?.pages.flatMap((page) => page.items) ?? [];
  }, [upvotesData?.pages]);

  // Get user's available weight
  const { data: userWeightData, refetch: refetchUserAvailableWeight } =
    trpc.likeProject.getUserAvailableWeight.useQuery(undefined, {
      enabled: !!profile,
      refetchOnWindowFocus: false,
      staleTime: 0,
    });

  // Like project mutation
  const likeProjectMutation = trpc.likeProject.likeProject.useMutation({
    onSuccess: async () => {
      refetchUpvotedProjects();
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
        refetchUpvotedProjects();
        refetchUserAvailableWeight();
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
      refetchUpvotedProjects();
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

  // Create a map for efficient projectLikeRecord lookup
  const projectLikeRecordMap = useMemo(() => {
    const map = new Map();
    if (upvotedProjects) {
      upvotedProjects.forEach((record) => {
        if (record.project?.id) {
          map.set(record.project.id, record);
        }
      });
    }
    return map;
  }, [upvotedProjects]);

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

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <div className="flex w-full flex-col">
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <ProjectCardSkeleton key={index} showBorder={true} />
            ))}
          </>
        ) : upvotedProjects.length > 0 ? (
          <>
            {upvotedProjects.map((item) => {
              const projectLikeRecord = projectLikeRecordMap.get(
                item.project?.id,
              );

              return (
                <ProjectCard
                  key={item.project?.id}
                  project={item.project as IProject}
                  showBorder={true}
                  weight={item.weight!}
                  onUpvote={handleUpvote}
                  userLikeRecord={
                    projectLikeRecord && item.project?.id
                      ? {
                          id: item.project.id,
                          weight: projectLikeRecord.weight || 0,
                        }
                      : null
                  }
                />
              );
            })}

            {isFetchingNextPage && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} showBorder={true} />
                ))}
              </>
            )}

            {hasNextPage && (
              <div className="flex justify-center py-4">
                <ECFButton
                  $size="small"
                  onPress={handleLoadMore}
                  isDisabled={isFetchingNextPage}
                  className="border border-black/10 bg-transparent text-black hover:bg-black/5"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Projects'}
                </ECFButton>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <ECFTypography type="body1" className="opacity-60">
              You haven't upvoted any projects yet.
            </ECFTypography>
          </div>
        )}
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
    </div>
  );
}
