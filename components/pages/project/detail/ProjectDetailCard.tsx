'use client';

import { cn, Image, Skeleton } from '@heroui/react';
import { FC } from 'react';

import { IProject } from '@/types';

interface ProjectDetailCardProps {
  project?: IProject;
}

const ProjectDetailCard: FC<ProjectDetailCardProps> = ({ project }) => {
  if (!project) {
    return <ProjectDetailCardSkeleton />;
  }
  return (
    <div
      className={cn(
        'mt-[10px] mx-[20px] mobile:mx-[10px]',
        'p-[20px] mobile:p-[14px]',
        'bg-white border border-black/10 rounded-[10px]',
        'flex justify-start items-start gap-[20px]',
      )}
    >
      <Image
        src={project.logoUrl}
        alt={project.name}
        width={100}
        height={100}
        className="overflow-hidden rounded-[10px] border border-black/10 object-cover"
      />
      <div className="flex flex-col gap-[10px]">
        <p className="text-[20px] font-[700] leading-tight text-[#202023]">
          {project.name}
        </p>
        <p className="text-[14px] font-[400] leading-[1.66] text-[#202023]">
          {project.tagline}
        </p>
        <div className="flex flex-wrap gap-[8px]">
          {project.categories.map((category) => {
            return (
              <span
                key={category}
                className="flex h-[22px] items-center rounded-[6px] bg-black/5 px-[12px] text-[12px] font-[600] leading-none text-black"
              >
                {category}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailCard;

const ProjectDetailCardSkeleton = () => {
  return (
    <div
      className={cn(
        'mt-[10px] mx-[20px] mobile:mx-[10px]',
        'p-[20px] mobile:p-[14px]',
        'bg-white border border-black/10 rounded-[10px]',
        'flex justify-start items-start gap-[20px]',
      )}
    >
      <Skeleton className="size-[100px] shrink-0 overflow-hidden rounded-[10px] border border-black/10" />

      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <Skeleton className="mobile:w-[150px] h-[25px] w-[180px]" />
        <Skeleton className="h-[23px] w-full" />

        <div className="flex flex-wrap gap-[8px]">
          {[1, 2, 3].map((index) => {
            return (
              <Skeleton
                key={index}
                className="h-[22px] w-[60px] rounded-[6px]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
