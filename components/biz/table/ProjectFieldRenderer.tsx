'use client';

import { Image, Skeleton } from '@heroui/react';
import Link from 'next/link';
import React from 'react';

import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface IProjectFieldRendererProps {
  projectValue: string | string[] | undefined;
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
    <div className="flex items-center justify-start gap-[10px]">
      <Image
        src={logoUrl}
        width={32}
        height={32}
        className="rounded-[5px] border border-black/10 object-cover"
      />
      <span className="text-[13px] font-[600] leading-[20px] text-black">
        {projectName}
      </span>
    </div>
  ) : (
    <Link
      href={`/project/${project.id}`}
      target="_blank"
      className="inline-flex cursor-pointer items-center text-[13px] font-[600] leading-[20px] hover:text-black/60 hover:underline"
    >
      {project.name}
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
      <div className="flex flex-col gap-[8px]">
        {projects.map((project) => (
          <ProjectColDisplay
            key={project.id}
            project={project}
            showProjectIconAndName={showProjectIconAndName}
          />
        ))}
      </div>
    );
  }

  return <>N/A</>;
};

export const extractProjectIds = (
  data: any[],
  keyNames: string | string[] = 'project',
): string[] => {
  if (!data || data.length === 0) return [];

  const keys = Array.isArray(keyNames) ? keyNames : [keyNames];

  const ids: string[] = [];

  data.forEach((item: any) => {
    keys.forEach((key) => {
      const value = item[key];

      if (value) {
        if (Array.isArray(value)) {
          const validArrayIds = value.filter(
            (id) =>
              typeof id === 'string' && /^\d+$/.test(id) && Number(id) > 0,
          );
          ids.push(...validArrayIds);
        } else if (
          typeof value === 'string' &&
          /^\d+$/.test(value) &&
          Number(value) > 0
        ) {
          ids.push(value);
        }
      }
    });
  });

  return [...new Set(ids)];
};
