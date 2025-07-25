import Link from 'next/link';

import { Button, ECFButton } from '@/components/base/button';
import { useUpvote } from '@/hooks/useUpvote';
import { IProject } from '@/types';

import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';
import ProjectCardSkeletonSmall from './ProjectCardSkeletonSmall';
import ProjectCardSmall from './ProjectCardSmall';

interface ProjectListWrapperProps {
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  projectList: IProject[];
  emptyMessage: string;
  onLoadMore: () => void;
  onSuccess: () => void;
  showCreator?: boolean;
  showTransparentScore?: boolean;
  showUpvote?: boolean;
  viewAllUrl?: string;
  viewAllText?: string;
  size?: 'normal' | 'sm';
  skeletonCount?: number;
}

export const ProjectListWrapper = ({
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  projectList,
  emptyMessage,
  onLoadMore,
  onSuccess,
  showCreator = true,
  showUpvote = true,
  showTransparentScore = false,
  viewAllUrl,
  viewAllText,
  size = 'normal',
  skeletonCount = 5,
}: ProjectListWrapperProps) => {
  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess,
    });

  if (isLoading) {
    return (
      <div className="flex-1 pb-2.5">
        {Array.from({ length: skeletonCount }).map((_, index) =>
          size === 'sm' ? (
            <ProjectCardSkeletonSmall
              key={index}
              showBorder={true}
              showCreator={showCreator}
              showUpvote={showUpvote}
            />
          ) : (
            <ProjectCardSkeleton
              key={index}
              showBorder={true}
              showCreator={showCreator}
              showTransparentScore={showTransparentScore}
              showUpvote={showUpvote}
            />
          ),
        )}
      </div>
    );
  }

  if (projectList.length === 0) {
    return (
      <div className="flex flex-1 justify-center py-[80px]">
        <p className="text-[16px] text-black/40">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {projectList.map((project, index) => {
        const projectLikeRecord = getProjectLikeRecord(project.id);
        const isLastItem = index === projectList.length - 1;
        return size === 'sm' ? (
          <ProjectCardSmall
            key={project.id}
            project={project}
            showBorder={!isLastItem}
            showCreator={showCreator}
            showUpvote={showUpvote}
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
        ) : (
          <ProjectCard
            key={project.id}
            project={project}
            showBorder={!isLastItem}
            showCreator={showCreator}
            showUpvote={showUpvote}
            showTransparentScore={showTransparentScore}
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

      {isFetchingNextPage &&
        Array.from({ length: 3 }).map((_, index) =>
          size === 'sm' ? (
            <ProjectCardSkeletonSmall
              key={`fetching-skeleton-${index}`}
              showBorder={true}
              showCreator={showCreator}
              showUpvote={showUpvote}
            />
          ) : (
            <ProjectCardSkeleton
              key={`fetching-skeleton-${index}`}
              showBorder={true}
              showCreator={showCreator}
              showTransparentScore={showTransparentScore}
              showUpvote={showUpvote}
            />
          ),
        )}

      {hasNextPage && (
        <div className="flex flex-1 justify-center py-4">
          <ECFButton
            onPress={onLoadMore}
            isDisabled={isFetchingNextPage}
            $size="small"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </ECFButton>
        </div>
      )}

      {viewAllUrl && (
        <Link href={viewAllUrl} className="mt-[10px] flex">
          <Button size="sm" className="w-full font-[400]">
            {viewAllText || 'View All'}
          </Button>
        </Link>
      )}

      {UpvoteModalComponent}
    </div>
  );
};
