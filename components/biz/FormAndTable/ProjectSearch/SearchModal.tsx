'use client';

import { X } from '@phosphor-icons/react';
import React from 'react';

import { Modal, ModalContent } from '@/components/base/modal';
import { IProject } from '@/types';

import TooltipWithQuestionIcon from '../TooltipWithQuestionIcon';

import SearchProjectItem from './SearchProjectItem';
import SearchProjectItemSkeleton from './SearchProjectItemSkeleton';
import SelectedProjectTag from './SelectedProjectTag';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  debouncedQuery: string;
  tempSelectedProjects: IProject[];
  onTempSelectedProjectsChange: (projects: IProject[]) => void;
  onConfirmSelection: () => void;
  onProjectSelect: (project: IProject) => void;
  isProjectSelected: (projectId: number) => boolean;
  isLoading: boolean;
  isFetching: boolean;
  allProjects: any[];
  multiple?: boolean;
  itemLabel?: string;
  searchModalTitle?: string;
  columnName?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  debouncedQuery,
  tempSelectedProjects,
  onTempSelectedProjectsChange,
  onConfirmSelection,
  onProjectSelect,
  isProjectSelected,
  isLoading,
  isFetching,
  allProjects,
  multiple = false,
  itemLabel,
  searchModalTitle,
  columnName = 'project',
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      hideCloseButton
      className="mx-4"
      classNames={{
        base: 'p-0',
        body: 'p-0 gap-0',
        // Ensure this modal stacks above ProjectDetailMainModal
        wrapper: 'z-[2000]',
      }}
    >
      <ModalContent className="w-[510px] rounded-[10px] border-2 border-[rgb(225,225,225)] bg-white shadow-none">
        {/* Modal Header */}
        <div className="flex min-h-[44px] items-center justify-between gap-[10px] px-[14px] pt-[14px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex items-center gap-[10px] rounded-[5px] border-none bg-[rgb(245,245,245)] px-[10px] py-[4px]">
              <span className="text-[14px] font-semibold text-black">
                {itemLabel || searchModalTitle || 'Search'}:
              </span>
              <div className="flex items-center gap-[5px] opacity-60">
                <span className="text-[14px] font-semibold text-[rgb(51,51,51)]">
                  {columnName}
                </span>
                <TooltipWithQuestionIcon content="This refers to the organization or program this project has received their grants from" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <div className="rounded-[5px] bg-[rgb(245,245,245)] px-[8px] py-[2px]">
              <span className="font-['Ubuntu_Mono'] text-[13px] font-bold text-black">
                Esc
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex size-[20px] items-center justify-center"
            >
              <X size={16} className="text-black" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-[14px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full border-none bg-transparent text-[14px] font-normal text-black placeholder:text-black/60 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Selected Projects Display */}
        {multiple && tempSelectedProjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-[10px] border-t border-black/10 px-[14px] py-[5px]">
            {tempSelectedProjects.map((project) => (
              <SelectedProjectTag
                key={project.id}
                project={project}
                onRemove={() => {
                  onTempSelectedProjectsChange(
                    tempSelectedProjects.filter((p) => p.id !== project.id),
                  );
                }}
              />
            ))}
          </div>
        )}

        {/* Search Results */}
        <div className="max-h-[320px] overflow-y-auto">
          {(isLoading || isFetching) && debouncedQuery.length >= 2 ? (
            <div className="flex flex-col p-[14px]">
              {Array.from({ length: 3 }).map((_, index) => (
                <SearchProjectItemSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : allProjects.length > 0 ? (
            <div className="flex flex-col p-[14px]">
              {allProjects.map((project) => (
                <SearchProjectItem
                  key={project.id}
                  project={project as unknown as IProject}
                  onSelect={onProjectSelect}
                  isSelected={isProjectSelected(project.id)}
                  multiple={multiple}
                />
              ))}
            </div>
          ) : debouncedQuery.length >= 2 && !isLoading && !isFetching ? (
            <div className="flex h-[60px] items-center justify-center">
              <span className="text-[14px] font-normal text-black/60">
                No projects found
              </span>
            </div>
          ) : null}
        </div>

        {/* Confirm Selection Button for Multiple Mode */}
        {multiple && tempSelectedProjects.length > 0 && (
          <div className="flex justify-end border-t border-black/10 bg-white/40 px-[14px] pb-[14px] pt-[10px] backdrop-blur-[10px]">
            <button
              onClick={onConfirmSelection}
              className="flex h-[36px] items-center justify-center rounded-[5px] bg-[rgb(74,74,74)] px-[10px] py-[8px] font-['Ubuntu_Mono'] text-[14px] font-bold text-white hover:bg-[rgb(64,64,64)]"
            >
              Confirm Selection
            </button>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SearchModal;
