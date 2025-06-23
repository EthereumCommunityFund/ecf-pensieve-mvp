'use client';

import ProjectCard from '@/components/pages/project/ProjectCard';
import { useUpvote } from '@/hooks/useUpvote';
import { IProject } from '@/types';

export interface IProjectListWithUpvoteProps {
  projectList: IProject[];
  onRefetch?: () => void;
}

const ProjectListWithUpvote = (props: IProjectListWithUpvoteProps) => {
  const { projectList, onRefetch } = props;

  const len = projectList.length;

  // Use the upvote hook with refresh callback
  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess: onRefetch,
    });

  return (
    <>
      <div className="mt-2.5 px-[10px]">
        {projectList.map((project, idx) => {
          const projectLikeRecord = getProjectLikeRecord(project.id);

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

      {UpvoteModalComponent}
    </>
  );
};

export default ProjectListWithUpvote;
