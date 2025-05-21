'use client';

import { cn, Image, Skeleton } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';

import ECFTypography from '@/components/base/typography';
import { formatTimeAgo } from '@/lib/utils';
import { IProject } from '@/types';
import { formatNumber } from '@/utils/formatters';

export function ProjectCardSkeleton() {
  return (
    <div className="py-[10px]">
      <div className="flex items-center justify-start gap-[20px] rounded-[10px] p-[10px]">
        <div className="flex flex-1 items-start gap-[14px]">
          <Skeleton className="mobile:size-[60px] size-[100px] rounded-[10px]" />
          <div className="mobile:max-w-full max-w-[440px] flex-1">
            <Skeleton className="h-[18px] w-[200px] rounded-[4px]" />
            <Skeleton className="mt-[6px] h-[18px] w-full rounded-[4px]" />
            <Skeleton className="mt-[6px] h-[18px] w-[120px] rounded-[4px]" />
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              <Skeleton className="h-[22px] w-[60px] rounded-[6px]" />
              <Skeleton className="h-[22px] w-[60px] rounded-[6px]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-[4px] text-center">
          <Skeleton className="mx-auto size-[40px] rounded-lg" />
          <Skeleton className="h-[13px] w-[30px] rounded-[4px]" />
          <Skeleton className="h-[11px] w-[20px] rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}

interface IProjectCardProps {
  project: IProject;
  showBorder?: boolean;
}

const ProjectCard = ({ project, showBorder = false }: IProjectCardProps) => {
  return (
    <div
      className={cn(
        showBorder && 'border-b border-[rgba(0, 0, 0, 0.1)]',
        'pb-[10px] pt-[10px]',
      )}
    >
      <Link
        href={`/project/pending/${project.id}`}
        className="mobile:items-start flex cursor-pointer items-center justify-start gap-5 rounded-[10px] p-2.5 transition-colors duration-200 hover:bg-[rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-1 items-start gap-[14px]">
          <div className="mobile:hidden size-[100px] overflow-hidden rounded-[10px] border border-[rgba(0,0,0,0.1)]">
            <Image
              src={project.logoUrl}
              as={NextImage}
              alt={project.name}
              className="rounded-[10px] object-cover"
              width={100}
              height={100}
            />
          </div>

          <div className="mobile:block hidden size-[60px] overflow-hidden rounded-[5px] border border-[rgba(0,0,0,0.1)]">
            <Image
              src={project.logoUrl}
              as={NextImage}
              alt={project.name}
              className="rounded-[5px] object-cover"
              width={60}
              height={60}
            />
          </div>

          <div className="mobile:max-w-full max-w-[440px] flex-1">
            <ECFTypography
              type={'body1'}
              className="font-semibold leading-[18px]"
            >
              {project.name}
            </ECFTypography>
            <ECFTypography
              type={'body2'}
              className="mt-[6px] leading-[18px] opacity-65"
            >
              {project.mainDescription}
            </ECFTypography>
            <p className="mt-[6px] text-[11px] leading-[18px] text-[rgba(0,0,0,0.8)]">
              <span className="opacity-60">by: </span>
              <span className="mx-[6px] font-bold underline">
                {project.creator?.name}
              </span>{' '}
              <span className="opacity-60">
                {formatTimeAgo(project.createdAt.getTime())}
              </span>
            </p>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {project.categories.map((tag) => (
                <div
                  key={tag}
                  className="flex h-[22px] items-center justify-center rounded-[6px] bg-[rgba(0,0,0,0.05)] px-3"
                >
                  <span className="text-[12px] font-semibold leading-[12px] text-black">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-col items-center justify-center gap-[4px] text-center">
          <div
            className={cn(
              'mx-auto flex items-center justify-center w-[40px] h-[40px] rounded-lg',
              'bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)]',
            )}
          >
            <Image
              src="/images/common/CaretUpDark.png"
              as={NextImage}
              alt={'vote'}
              width={24}
              height={24}
            />
          </div>
          <p className="font-saria text-[13px] font-semibold leading-[20px] text-black opacity-60">
            {formatNumber(0)}
          </p>
          <p className="font-saria text-[11px] font-semibold leading-[17px] text-[rgba(0,0,0,0.7)] opacity-60">
            {formatNumber(0)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
