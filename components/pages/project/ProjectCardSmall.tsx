'use client';

import { Button, cn, Image } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';

import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { IProfile, IProject } from '@/types';
import { IEssentialItemKey } from '@/types/item';

interface IProjectCardSmallProps {
  project: IProject;
  showBorder?: boolean;
  weight?: number;
  showCreator?: boolean;
  showUpvote?: boolean;
  onUpvote?: (projectId: number) => void;
  userLikeRecord?: {
    id: number;
    weight: number | null;
  } | null;
}

const ProjectCardSmall = ({
  project,
  showBorder = false,
  weight,
  showCreator = true,
  showUpvote = true,
  onUpvote,
  userLikeRecord,
}: IProjectCardSmallProps) => {
  const projectSnapDataMap = useMemo(() => {
    if (!!project?.projectSnap?.items && project.projectSnap.items.length > 0) {
      return project.projectSnap.items.reduce(
        (prev: any, cur: any) => {
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

  const getItemValue = useCallback(
    (itemKey: IEssentialItemKey) => {
      return projectSnapDataMap[itemKey] || project[itemKey] || '';
    },
    [projectSnapDataMap, project],
  );

  const logoUrl = getItemValue('logoUrl');
  const projectName = getItemValue('name');
  const tagline = getItemValue('tagline');

  return (
    <div className="py-0">
      <div className="rounded-[5px] px-[10px] py-[7px] hover:bg-[rgba(0,0,0,0.05)]">
        <div className="mobile:items-start flex items-center justify-start gap-[14px]">
          <Link
            href={`/project/${project.id}`}
            className="-m-2.5 flex flex-1 cursor-pointer items-start gap-[14px] rounded-[10px] p-2.5 transition-colors duration-200"
          >
            <div className="mobile:hidden box-content size-[40px] overflow-hidden rounded-[5px]">
              <Image
                src={logoUrl}
                as={NextImage}
                alt={projectName}
                className="rounded-none object-cover"
                width={40}
                height={40}
              />
            </div>

            <div className="mobile:block hidden size-[40px] overflow-hidden rounded-[5px]">
              <Image
                src={logoUrl}
                as={NextImage}
                alt={projectName}
                className="rounded-none object-cover"
                width={40}
                height={40}
              />
            </div>

            <div className="mobile:max-w-full flex-1">
              <p className="text-[14px] font-semibold leading-[20px] text-black">
                {projectName}
              </p>
              <p className="mt-[4px] text-[13px] leading-[18px] text-black opacity-60">
                {tagline}
              </p>

              {showCreator && (
                <p className="mt-[6px] text-[11px] leading-[18px] text-[rgba(0,0,0,0.8)]">
                  <span className="opacity-60">by: </span>
                  <span className="mx-[6px] font-bold underline">
                    {(project.creator as IProfile)?.name}
                  </span>{' '}
                  <span className="opacity-60">
                    {formatTimeAgo(new Date(project.createdAt).getTime())}
                  </span>
                </p>
              )}
            </div>
          </Link>

          {showUpvote && (
            <div className="flex flex-col items-center justify-center gap-[3px] text-center">
              <Button
                isIconOnly
                className={cn(
                  'rounded-[8px] min-w-0 min-h-0 size-[30px]',
                  'bg-transparent hover:bg-black/10 opacity-30 hover:opacity-50',
                  userLikeRecord && 'opacity-100',
                )}
                onPress={() => {
                  onUpvote?.(project.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20.0303 14.4697L12.5303 6.96966C12.3897 6.82901 12.1989 6.75 12 6.75C11.8011 6.75 11.6103 6.82901 11.4697 6.96966L3.96968 14.4697C3.86479 14.5745 3.79336 14.7082 3.76441 14.8537C3.73547 14.9992 3.75032 15.15 3.80709 15.287C3.86385 15.424 3.95998 15.5412 4.08332 15.6236C4.20666 15.706 4.35167 15.75 4.5 15.75H19.5C19.6483 15.75 19.7933 15.706 19.9167 15.6236C20.04 15.5412 20.1362 15.424 20.1929 15.287C20.2497 15.15 20.2645 14.9992 20.2356 14.8537C20.2067 14.7082 20.1352 14.5745 20.0303 14.4697Z"
                    fill={userLikeRecord ? '#64C0A5' : 'black'}
                  />
                </svg>
              </Button>

              <p className="font-saira text-[12px] font-semibold leading-[12px] text-black opacity-60">
                {formatNumber(project.support || 0)}
              </p>
            </div>
          )}
        </div>
      </div>

      {weight && (
        <p className="mt-[10px] text-right text-[13px] text-black/50">
          You allocated {weight}
        </p>
      )}
    </div>
  );
};

export default ProjectCardSmall;
