'use client';

import { Image } from '@heroui/react';
import Link from 'next/link';
import React, { useCallback } from 'react';

import { Button } from '@/components/base';
import { calcTransparentScore } from '@/components/biz/project/TransparentScore';
import { ShieldStarIcon } from '@/components/icons';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface SearchProjectItemProps {
  project: IProject;
  onSelect: (project: IProject) => void;
  isSelected?: boolean;
  multiple?: boolean;
}

const SearchProjectItem: React.FC<SearchProjectItemProps> = ({
  project,
  onSelect,
}) => {
  const { logoUrl, projectName, tagline } = useProjectItemValue(project);

  // Calculate transparency score
  const transparencyScore = project.itemsTopWeight
    ? calcTransparentScore(project.itemsTopWeight)
    : 0;

  const onTriggerSelect = useCallback(() => {
    onSelect(project);
  }, [onSelect, project]);

  return (
    <div className="flex items-center justify-between gap-[14px] rounded-[10px] p-[10px] hover:bg-gray-50">
      <div className="flex min-w-0 flex-1 items-center gap-[14px] transition-colors">
        {/* Project Icon */}
        <div className="size-[40px] shrink-0 overflow-hidden rounded-[5px] border border-black/10 bg-gray-100">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt={projectName}
              className="size-[40px] rounded-none object-cover"
            />
          )}
        </div>

        {/* Project Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-[6px] overflow-hidden">
          {/* Project Name and Transparency */}
          <div className="flex min-w-0 items-center gap-[6px]">
            <span className="min-w-0 shrink truncate text-[14px] font-semibold text-black">
              {projectName}
            </span>
            <div className="flex shrink-0 items-center gap-[6px]">
              <ShieldStarIcon className="size-[18px]" />
              <div className="flex items-center gap-[5px]">
                <span className="text-[13px] font-normal text-black">
                  Transparency:
                </span>
                <span className="text-[13px] font-semibold text-black">
                  {transparencyScore}%
                </span>
              </div>
            </div>
          </div>
          {/* Tagline */}
          {tagline && (
            <p className="line-clamp-2 text-[13px] font-normal text-black">
              {tagline}
            </p>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex shrink-0 flex-col items-center gap-[10px]">
        <Button
          onClick={onTriggerSelect}
          className={`h-[24px] w-[55px] rounded-[5px] border-none bg-[#F5F5F5] text-[13px] font-bold text-black/50`}
        >
          Select
        </Button>

        {/* View Button */}
        <Link
          href={`/project/${project.id}`}
          target="_blank"
          className=""
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            className={`h-[24px] w-[55px] rounded-[5px] border border-black/10 bg-transparent text-[13px] font-bold text-black/50`}
          >
            View
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SearchProjectItem;
