import { useMemo } from 'react';

import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
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
              <ProjectCardSkeleton key={index} />
            ))}
          </>
        ) : upvotedProjects.length > 0 ? (
          <>
            {upvotedProjects.map((item) => (
              <ProjectCard
                key={item.project?.id}
                project={item.project as IProject}
                showBorder={true}
              />
            ))}

            {isFetchingNextPage && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <ProjectCardSkeleton key={index} />
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
    </div>
  );
}
