'use client';

import { Image, Skeleton } from '@heroui/react';
import Link from 'next/link';
import React from 'react';

import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface IProjectFieldRendererProps {
  projectValue: string | number | Array<string | number> | undefined;
  projectsMap: Map<number, IProject> | undefined;
  isLoadingProjects: boolean;
  showProjectIconAndName?: boolean;
}

// Reusable project tag component
export const ProjectColDisplay: React.FC<{
  project: IProject;
  showProjectIconAndName?: boolean;
}> = ({ project, showProjectIconAndName = false }) => {
  const { logoUrl, projectName } = useProjectItemValue(project);
  return showProjectIconAndName ? (
    <div className="flex items-center gap-[10px]">
      <div className="size-[32px] shrink-0">
        <Image
          src={logoUrl}
          width={32}
          height={32}
          className="size-[32px] shrink-0 rounded-[5px] border border-black/10 object-cover"
        />
      </div>
      <span className="min-w-0 break-words text-[13px] font-[600] leading-[20px] text-black">
        {projectName}
      </span>
    </div>
  ) : (
    <Link
      href={`/project/${project.id}`}
      target="_blank"
      className="inline-block cursor-pointer break-words text-[13px] font-[600] leading-[20px] hover:text-black/60 hover:underline"
    >
      {projectName}
    </Link>
  );
};

export const ProjectFieldRenderer: React.FC<IProjectFieldRendererProps> = ({
  projectValue,
  projectsMap,
  isLoadingProjects,
  showProjectIconAndName,
}) => {
  if (!projectValue) return <>N/A</>;

  // Handle direct numeric ID
  if (typeof projectValue === 'number') {
    if (projectValue <= 0) return <>N/A</>;
    if (isLoadingProjects) {
      return <Skeleton className="h-[20px] w-[50px] rounded-sm" />;
    }
    const projectData = projectsMap?.get(projectValue);
    if (projectData) {
      return (
        <ProjectColDisplay
          project={projectData}
          showProjectIconAndName={showProjectIconAndName}
        />
      );
    }
    return <>N/A</>;
  }

  // Check if it's a string
  if (typeof projectValue === 'string') {
    if (projectValue === 'N/A') return <>N/A</>;

    // Check if it's a projectId (numeric string)
    if (/^\d+$/.test(projectValue) && Number(projectValue) > 0) {
      if (isLoadingProjects) {
        return <Skeleton className="h-[20px] w-[50px] rounded-sm" />;
      }

      const numId = parseInt(projectValue, 10);
      const projectData = projectsMap?.get(numId);

      if (projectData) {
        return (
          <ProjectColDisplay
            project={projectData}
            showProjectIconAndName={showProjectIconAndName}
          />
        );
      }
      // If ID lookup failed, show N/A (avoid showing raw numeric string)
      return <>N/A</>;
    }

    // Legacy projectName data
    return <>{projectValue}</>;
  }

  // Array of project IDs
  if (Array.isArray(projectValue)) {
    if (isLoadingProjects) {
      return <Skeleton className="h-[20px] w-[50px] rounded-sm" />;
    }

    const projects = projectValue
      .map((id) => {
        if (typeof id === 'number' && Number.isFinite(id) && id > 0) {
          return projectsMap?.get(id);
        }
        if (typeof id === 'string' && /^\d+$/.test(id)) {
          const numId = parseInt(id, 10);
          return projectsMap?.get(numId);
        }
        return null;
      })
      // Filter out both null and undefined entries to avoid runtime errors
      .filter((p): p is IProject => Boolean(p));

    if (projects.length === 0) return <>N/A</>;

    return (
      <div className="flex flex-wrap items-center">
        {projects.map((project, index) => (
          <React.Fragment key={project.id}>
            <ProjectColDisplay
              project={project}
              showProjectIconAndName={showProjectIconAndName}
            />
            {index < projects.length - 1 && (
              <span className="mx-1 text-[13px] leading-[20px] text-black">
                ,{' '}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <>N/A</>;
};
