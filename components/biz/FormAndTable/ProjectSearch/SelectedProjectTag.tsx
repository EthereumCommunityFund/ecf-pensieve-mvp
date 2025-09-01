'use client';

import Link from 'next/link';
import React from 'react';

import { XCircleSolidIcon } from '@/components/icons/XCircle';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface SelectedProjectTagProps {
  project: IProject;
  onRemove?: () => void;
}

const SelectedProjectTag: React.FC<SelectedProjectTagProps> = ({
  project,
  onRemove,
}) => {
  const { projectName } = useProjectItemValue(project);

  // If onRemove is not provided, render as a clickable link
  if (!onRemove) {
    return (
      <Link
        href={`/project/${project.id}`}
        target={'_blank'}
        className="flex min-h-[28px] items-center gap-[5px] rounded-[5px] border border-black/20 px-[10px] py-[4px] transition-colors hover:bg-gray-50"
      >
        <span className="text-[13px] font-normal text-black">
          {projectName}
        </span>
      </Link>
    );
  }

  // Original behavior with remove button for modal usage
  return (
    <div className="flex min-h-[28px] items-center gap-[5px] rounded-[5px] border border-black/20 px-[10px] py-[4px]">
      <span className="text-[13px] font-normal text-black">{projectName}</span>
      <button onClick={onRemove} className="flex items-center justify-center">
        <XCircleSolidIcon />
      </button>
    </div>
  );
};

export default SelectedProjectTag;
export { SelectedProjectTag };
