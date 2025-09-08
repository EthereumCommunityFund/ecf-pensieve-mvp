import { cn } from '@heroui/react';
import { CaretUp } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { useUpvote } from '@/hooks/useUpvote';
import { IProject } from '@/types';

import ProjectActionButton from './ProjectActionButton';

export interface IUpvoteButtonProps {
  projectId: number;
  project: IProject;
}

const UpvoteButton: FC<IUpvoteButtonProps> = ({ projectId, project }) => {
  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote();

  const projectLikeRecord = getProjectLikeRecord(projectId);

  const isUserUpvoted = !!projectLikeRecord;

  const onClick = useCallback(() => {
    handleUpvote(Number(projectId));
  }, [projectId, handleUpvote]);

  return (
    <>
      <ProjectActionButton
        isIconOnly={false}
        className={cn(
          'min-w-[100px] w-[100px]',
          isUserUpvoted ? 'bg-black hover:bg-black/80' : 'bg-[#F5F5F5]',
        )}
        onPress={onClick}
      >
        <div className="flex w-full items-center justify-between">
          <span
            className={cn(
              'flex-1 text-left font-mona text-[16px] font-[600] ',
              isUserUpvoted ? 'text-white' : 'text-black/50',
            )}
          >
            {project.support || 0}
          </span>
          <CaretUp
            weight="bold"
            color={isUserUpvoted ? 'white' : 'black'}
            className={cn(
              'size-[16px]',
              isUserUpvoted ? 'opacity-100' : 'opacity-50',
            )}
          />
        </div>
      </ProjectActionButton>

      {UpvoteModalComponent}
    </>
  );
};

export default UpvoteButton;
