'use client';

import { cn, Image, Link } from '@heroui/react';
import NextImage from 'next/image';

import ECFTypography from '@/components/base/typography';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { IProject } from '@/types';

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
        href={`/project/${project.id}`}
        className="flex cursor-pointer items-center justify-start gap-5 rounded-[10px] p-2.5 transition-colors duration-200 hover:bg-[rgba(0,0,0,0.05)] mobile:items-start"
      >
        <div className="flex flex-1 items-start gap-[14px]">
          <div className="border-[rgba(0, 0, 0.1)] size-[100px] overflow-hidden rounded-[10px] border mobile:hidden">
            <Image
              src={project.logoUrl}
              as={NextImage}
              alt={project.name}
              className="object-cover"
              width={100}
              height={100}
            />
          </div>

          <div className="border-[rgba(0, 0, 0.1)] size-[60px] overflow-hidden rounded-[5px] border lg:hidden pc:hidden tablet:hidden">
            <Image
              src={project.logoUrl}
              as={NextImage}
              alt={project.name}
              className="object-cover"
              width={60}
              height={60}
            />
          </div>

          <div className="max-w-[440px] flex-1 mobile:max-w-full">
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
            <p className="text-[rgba(0, 0, 0.8)] mt-[6px] text-[11px] leading-[18px]">
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
          <p className="text-[rgba(0, 0, 0.7)] font-saria text-[11px] font-semibold leading-[17px] opacity-60">
            {formatNumber(0)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
