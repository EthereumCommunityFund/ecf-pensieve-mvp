'use client';

import { Plus, X } from '@phosphor-icons/react';
import React from 'react';

import { IProject } from '@/types';

interface ProjectTagProps {
  project: IProject;
  projectName: string;
  onRemove: () => void;
  disabled?: boolean;
}

interface ProjectTagsDisplayProps {
  projects: Array<{ project: IProject; name: string }>;
  onRemove: (projectId: string) => void;
  onAdd: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Individual project tag component with remove functionality
 */
export const ProjectTag: React.FC<ProjectTagProps> = ({
  projectName,
  onRemove,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-[5px] rounded-[6px] bg-gray-100 px-[8px] py-[2px]">
      <span className="max-w-[100px] truncate text-[12px] text-black">
        {projectName}
      </span>
      {!disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex size-[16px] items-center justify-center hover:opacity-70"
          aria-label={`Remove ${projectName}`}
        >
          <X size={16} className="text-black" />
        </button>
      )}
    </div>
  );
};

/**
 * Container for displaying multiple project tags with add functionality
 * Based on Figma design specs: 231×42px container with 8px border radius
 */
const ProjectTagsDisplay: React.FC<ProjectTagsDisplayProps> = ({
  projects,
  onRemove,
  onAdd,
  disabled = false,
  placeholder = 'Search or select organization',
}) => {
  return (
    <div
      className={`flex min-h-[42px] w-full items-center rounded-[8px] border border-[rgb(84,85,104)] px-[10px] py-[6px] ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      onClick={() => !disabled && projects.length === 0 && onAdd()}
    >
      {/* Tags container */}
      <div className="flex flex-1 flex-wrap items-center gap-[5px]">
        {projects.length > 0 ? (
          <>
            {/* Display project tags */}
            {projects.map(({ project, name }) => (
              <ProjectTag
                key={project.id}
                project={project}
                projectName={name}
                onRemove={() => onRemove(project.id.toString())}
                disabled={disabled}
              />
            ))}

            {/* Add button */}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="flex size-[18px] items-center justify-center hover:opacity-70"
                aria-label="Add organization"
              >
                <Plus size={18} className="text-black" />
              </button>
            )}
          </>
        ) : (
          <span className="text-[13px] text-black/60">{placeholder}</span>
        )}
      </div>
    </div>
  );
};

export default ProjectTagsDisplay;
