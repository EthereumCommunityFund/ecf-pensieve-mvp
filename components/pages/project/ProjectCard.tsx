'use client';

import { Button, cn, Image, Skeleton } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';

import ECFTypography from '@/components/base/typography';
import { TotalItemCount } from '@/constants/tableConfig';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { IProfile, IProject } from '@/types';
import { IEssentialItemKey } from '@/types/item';

interface IProjectCardSkeletonProps {
  showBorder?: boolean;
}

export function ProjectCardSkeleton({
  showBorder = false,
}: IProjectCardSkeletonProps) {
  return (
    <div
      className={cn(
        showBorder && 'border-b border-[rgba(0, 0, 0, 0.1)]',
        'py-[10px] mobile:py-[5px]',
      )}
    >
      <div className="mobile:items-start flex items-center justify-start gap-5 rounded-[10px] p-2.5">
        <div className="flex flex-1 items-start gap-[14px]">
          <Skeleton className="mobile:hidden size-[100px] rounded-[10px]" />
          <Skeleton className="mobile:block hidden size-[60px] rounded-[5px]" />
          <div className="mobile:max-w-full flex-1">
            <Skeleton className="h-[18px] w-[200px] rounded-[4px]" />
            <Skeleton className="mt-[6px] h-[18px] w-full rounded-[4px]" />
            <Skeleton className="mt-[6px] h-[18px] w-[180px] rounded-[4px]" />
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              <Skeleton className="h-[22px] w-[60px] rounded-[6px]" />
              <Skeleton className="h-[22px] w-[80px] rounded-[6px]" />
              <Skeleton className="h-[22px] w-[50px] rounded-[6px]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-[4px] text-center">
          <Skeleton className="size-[40px] rounded-[8px]" />
          <Skeleton className="h-[20px] w-[40px] rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}

interface IProjectCardProps {
  project: IProject;
  showBorder?: boolean;
  weight?: number;
  showTransparentScore?: boolean;
  showUpvote?: boolean;
  onUpvote?: (projectId: number) => void;
  userLikeRecord?: {
    id: number;
    weight: number | null;
  } | null;
}

const ProjectCard = ({
  project,
  showBorder = false,
  weight,
  showTransparentScore = false,
  showUpvote = true,
  onUpvote,
  userLikeRecord,
}: IProjectCardProps) => {
  const projectSnapDataMap = useMemo(() => {
    if (!!project?.projectSnap?.items && project.projectSnap.items.length > 0) {
      return project.projectSnap.items.reduce(
        (prev, cur) => {
          return {
            ...prev,
            [cur.key]: cur.value,
          };
        },
        {} as Record<IEssentialItemKey, any>,
      );
    }
    return {} as Record<IEssentialItemKey, any>;
  }, [project]);

  const displayedItemCount = useMemo(() => {
    return project?.projectSnap?.items.length || 20;
  }, [project]);

  const itemLeftCount = useMemo(() => {
    return TotalItemCount - displayedItemCount;
  }, [displayedItemCount]);

  const getItemValue = useCallback(
    (itemKey: IEssentialItemKey) => {
      return projectSnapDataMap[itemKey] || project[itemKey] || '';
    },
    [projectSnapDataMap, project],
  );

  const logoUrl = getItemValue('logoUrl');
  const projectName = getItemValue('name');
  const tagline = getItemValue('tagline');
  const categories = useMemo(() => {
    const cats = getItemValue('categories');
    if (typeof cats === 'string') {
      try {
        const parsed = JSON.parse(cats);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(cats) ? cats : [];
  }, [getItemValue]);

  return (
    <div
      className={cn(
        showBorder && 'border-b border-[rgba(0, 0, 0, 0.1)]',
        'py-[10px] mobile:py-[5px]',
      )}
    >
      <div className="mobile:items-start flex items-center justify-start gap-5 rounded-[10px] p-2.5 hover:bg-[rgba(0,0,0,0.05)]">
        <Link
          href={`/project/${project.id}`}
          className="-m-2.5 flex flex-1 cursor-pointer items-start gap-[14px] rounded-[10px] p-2.5 transition-colors duration-200"
        >
          <div className="mobile:hidden box-content size-[100px] overflow-hidden rounded-[10px] ">
            <Image
              src={logoUrl}
              as={NextImage}
              alt={projectName}
              className="rounded-none object-cover"
              width={100}
              height={100}
            />
          </div>

          <div className="mobile:block hidden size-[60px] overflow-hidden rounded-[5px] ">
            <Image
              src={logoUrl}
              as={NextImage}
              alt={projectName}
              className="rounded-none object-cover"
              width={60}
              height={60}
            />
          </div>

          <div className="mobile:max-w-full flex-1">
            <ECFTypography
              type={'body1'}
              className="font-semibold leading-[20px]"
            >
              {projectName}
            </ECFTypography>
            <ECFTypography
              type={'body2'}
              className="mt-[4px] leading-[18px] opacity-60"
            >
              {tagline}
            </ECFTypography>
            <p className="mt-[6px] text-[11px] leading-[18px] text-[rgba(0,0,0,0.8)]">
              <span className="opacity-60">by: </span>
              <span className="mx-[6px] font-bold underline">
                {(project.creator as IProfile)?.name}
              </span>{' '}
              <span className="opacity-60">
                {formatTimeAgo(new Date(project.createdAt).getTime())}
              </span>
            </p>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {categories.map((tag) => (
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
        </Link>

        {showUpvote && (
          <div className="flex flex-col items-center justify-center gap-[4px] text-center">
            <Button
              isIconOnly
              className={cn(
                'rounded-[8px] size-[40px]',
                userLikeRecord
                  ? 'bg-[#64C0A5] hover:bg-[#75c2ab]'
                  : 'bg-black/5 hover:bg-black/10',
              )}
              onPress={() => {
                onUpvote?.(project.id);
              }}
            >
              <Image
                src={
                  userLikeRecord
                    ? '/images/common/CaretUpLight.png'
                    : '/images/common/CaretUpDark.png'
                }
                as={NextImage}
                alt="upvote"
                width={24}
                height={24}
              />
            </Button>

            <ECFTypography
              type="caption"
              className="text-[13px] font-semibold leading-[20px] text-black opacity-60"
            >
              {formatNumber(project.support || 0)}
            </ECFTypography>
          </div>
        )}
      </div>
      {weight && (
        <ECFTypography
          type={'caption'}
          className="mt-[10px] text-right opacity-50"
        >
          You allocated {weight}
        </ECFTypography>
      )}
    </div>
  );
};

export default ProjectCard;
