'use client';

import React from 'react';

import { XCircleSolidIcon } from '@/components/icons/XCircle';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface SelectedProjectChipProps {
  project: IProject;
  onRemove: () => void;
}

// Component for selected project chips in the input field
const SelectedProjectChip: React.FC<SelectedProjectChipProps> = ({
  project,
  onRemove,
}) => {
  const { projectName } = useProjectItemValue(project);

  return (
    <div className="flex min-h-[20px] items-center gap-[5px]">
      <span className="text-[13px] font-[600] leading-[20px] text-black">
        {projectName}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex items-center justify-center"
      >
        <XCircleSolidIcon />
      </button>
    </div>
  );
};

export default SelectedProjectChip;
