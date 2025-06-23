import { useMemo } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import { useUpvote } from '@/hooks/useUpvote';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

import { useProfileData } from './dataContext';

export default function Upvotes() {
  const { user } = useProfileData();

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

  // Use the upvote hook with refresh callback
  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess: refetchUpvotedProjects,
    });

  // Create a map for efficient projectLikeRecord lookup for this specific page
  const localProjectLikeRecordMap = useMemo(() => {
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
              const projectLikeRecord = localProjectLikeRecordMap.get(
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

      {UpvoteModalComponent}
    </div>
  );
}
