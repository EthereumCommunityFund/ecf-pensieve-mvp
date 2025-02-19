'use client';

import ProjectCard from '@/components/pages/home/projectCard';

import { IProject } from './homeList';

export interface IProjectListProps {
	projectList: IProject[];
}

const ProjectList = (props: IProjectListProps) => {
	const { projectList } = props;

	return (
		<div className="mt-5 px-[10px]">
			{projectList.map((project, idx) => (
				<ProjectCard key={project.id} project={project} showBorder={idx !== 0} />
			))}
		</div>
	);
};

export default ProjectList;
