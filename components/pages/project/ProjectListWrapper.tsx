import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import { useUpvote } from '@/hooks/useUpvote';
import { IProject } from '@/types';

import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';

interface ProjectListWrapperProps {
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  projectList: IProject[];
  emptyMessage: string;
  onLoadMore: () => void;
  onSuccess: () => void;
  showTransparentScore?: boolean;
  showUpvote?: boolean;
}

export const ProjectListWrapper = ({
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  projectList,
  emptyMessage,
  onLoadMore,
  onSuccess,
  showUpvote = true,
  showTransparentScore = false,
}: ProjectListWrapperProps) => {
  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess,
    });

  if (isLoading) {
    return (
      <div className="flex-1 pb-2.5">
        {Array.from({ length: 10 }).map((_, index) => (
          <ProjectCardSkeleton key={index} showBorder={true} />
        ))}
      </div>
    );
  }

  if (projectList.length === 0) {
    return (
      <div className="flex flex-1 justify-center py-[80px]">
        <ECFTypography type="subtitle1">{emptyMessage}</ECFTypography>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-2.5">
      {projectList.map((project, index) => {
        const projectLikeRecord = getProjectLikeRecord(project.id);
        const isLastItem = index === projectList.length - 1;
        return (
          <ProjectCard
            key={project.id}
            project={project}
            showBorder={!isLastItem}
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

      {isFetchingNextPage && <ProjectCardSkeleton showBorder={true} />}

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
      {UpvoteModalComponent}
    </div>
  );
};
