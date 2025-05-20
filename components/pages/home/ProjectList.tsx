'use client';

import ProjectCard from '@/components/pages/project/detail/ProjectCard';
import { IProject } from '@/types';

export interface IProjectListProps {
  projectList: IProject[];
}

const ProjectList = (props: IProjectListProps) => {
  const { projectList } = props;

  const len = projectList.length;

  return (
    <div className="mt-2.5 px-[10px]">
      {projectList.map((project, idx) => (
        <ProjectCard
          key={project.id}
          project={project}
          showBorder={idx !== len - 1}
        />
      ))}
    </div>
  );
};

export default ProjectList;
