'use client';

import { X } from '@phosphor-icons/react';
import React from 'react';

import { IProject } from '@/types';

interface ProjectTagProps {
  project: IProject;
  projectName: string;
  onRemove?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'selected';
}

/**
 * Individual project tag component
 * Design specs:
 * - Height: 24px (flexible based on content)
 * - Background: rgb(245, 245, 245) for default, can vary for selected
 * - Text: 12px, black
 * - Delete icon: 16×16px XCircle
 * - Gap between text and icon: 5px
 */
const ProjectTag: React.FC<ProjectTagProps> = ({
  projectName,
  onRemove,
  disabled = false,
  variant = 'default',
}) => {
  const bgColor = variant === 'selected' ? 'bg-green-50' : 'bg-gray-100';
  const borderColor =
    variant === 'selected' ? 'border-green-300' : 'border-transparent';

  return (
    <div
      className={`inline-flex items-center gap-[5px] rounded-[6px] border ${bgColor} ${borderColor} px-[8px] py-[2px] transition-colors`}
    >
      <span className="max-w-[120px] truncate text-[12px] font-normal text-black">
        {projectName}
      </span>
      {!disabled && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="flex size-[16px] shrink-0 items-center justify-center rounded-full transition-opacity hover:bg-black/10 hover:opacity-70"
          aria-label={`Remove ${projectName}`}
        >
          <X size={12} className="text-black/60" />
        </button>
      )}
    </div>
  );
};

export default ProjectTag;
