'use client';

import { cn, Image, Skeleton } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/base';
import NAButton from '@/components/base/NAButton';
import NADisplay from '@/components/base/NADisplay';
import { Modal, ModalContent } from '@/components/base/modal';
import { calcTransparentScore } from '@/components/biz/project/TransparentScore';
import {
  PlusSquareOutlineIcon,
  SearchIcon,
  ShieldStarIcon,
} from '@/components/icons';
import { XCircleSolidIcon } from '@/components/icons/XCircle';
import { AllItemConfig } from '@/constants/itemConfig';
import { NA_VALUE } from '@/constants/naSelection';
import { useNASelection } from '@/hooks/useNASelection';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { useProjectsByIds } from '@/hooks/useProjectsByIds';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { idsArrayEqual } from '@/utils/formHelpers';

import TooltipWithQuestionIcon from './TooltipWithQuestionIcon';

interface ProjectSearchSelectorProps {
  value?: string | string[]; // project name/names or custom name/names
  onChange: (
    value: string | string[],
    projectData?: IProject | IProject[],
  ) => void;
  onBlur?: () => void; // Optional onBlur handler for form integration
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  columnName?: string;
  multiple?: boolean; // 是否启用多选模式
  allowNA?: boolean; // 是否显示 N/A 选项
  naLabel?: string; // N/A 按钮文本
  itemKey: IPocItemKey;
  searchModalTitle?: string;
}

interface SearchProjectItemProps {
  project: IProject;
  onSelect: (project: IProject) => void;
  isSelected?: boolean;
  multiple?: boolean;
}

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

const SearchProjectItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-[14px] border-b border-black/5 p-[10px] last:border-b-0">
      <div className="flex min-w-0 flex-1 items-center gap-[14px]">
        {/* Project Icon Skeleton */}
        <Skeleton className="size-[40px] shrink-0 rounded-[5px]" />

        {/* Project Info Skeleton */}
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          {/* Project Name and Transparency Skeleton */}
          <div className="flex items-center gap-[6px]">
            <Skeleton className="h-[18px] w-[120px] rounded-[4px]" />
            <div className="flex shrink-0 items-center gap-[6px]">
              <Skeleton className="size-[18px] rounded-full" />
              <Skeleton className="h-[16px] w-[100px] rounded-[4px]" />
            </div>
          </div>
          {/* Tagline Skeleton */}
          <Skeleton className="h-[16px] w-full rounded-[4px]" />
          <Skeleton className="h-[16px] w-4/5 rounded-[4px]" />
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <Skeleton className="h-[24px] w-[55px] rounded-[4px]" />
        <Skeleton className="h-[24px] w-[55px] rounded-[4px]" />
      </div>
    </div>
  );
};

const SearchProjectItem: React.FC<SearchProjectItemProps> = ({
  project,
  onSelect,
}) => {
  const { logoUrl, projectName, tagline } = useProjectItemValue(project);

  // 计算透明度分数
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

const ProjectSearchSelector: React.FC<ProjectSearchSelectorProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  placeholder = 'Search or select organization',
  multiple = false,
  allowNA = false,
  naLabel = 'N/A',
  searchModalTitle,
  itemKey,
  columnName = 'project',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedProjects, setSelectedProjects] = useState<IProject[]>([]);
  const [tempSelectedProjects, setTempSelectedProjects] = useState<IProject[]>(
    [],
  );

  // Use N/A selection hook
  const { isNASelected, selectNA, clearNA } = useNASelection(
    value,
    onChange,
    multiple,
  );

  const itemLabel = useMemo(() => {
    return AllItemConfig[itemKey]?.label;
  }, [itemKey]);

  // Use hook to fetch project data by IDs
  // Memoize projectIds to avoid unnecessary re-renders
  const projectIds = useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return value;
    }
    // In single mode, if value is a projectId (not NA_VALUE), wrap it in array
    if (!multiple && typeof value === 'string' && value !== NA_VALUE) {
      // Check if it's a numeric string (projectId) or project name
      const isProjectId = /^\d+$/.test(value);
      return isProjectId ? [value] : [];
    }
    return [];
  }, [multiple, value]);

  const { projects: fetchedProjects, isLoading: isLoadingProjects } =
    useProjectsByIds(projectIds, {
      enabled: projectIds.length > 0,
    });

  // Initialize selected projects with protection against unnecessary resets
  useEffect(() => {
    if (!multiple) {
      // Single select mode - set fetched project if we have a projectId
      if (fetchedProjects && fetchedProjects.length > 0) {
        setSelectedProjects(fetchedProjects);
      } else if (!value || value === NA_VALUE) {
        setSelectedProjects([]);
      }
      return;
    }

    // Multi-select mode with state protection
    if (fetchedProjects && fetchedProjects.length > 0) {
      // Only update if the project IDs have actually changed
      setSelectedProjects((prev) => {
        const currentIds = prev.map((p) => p.id.toString());
        const fetchedIds = fetchedProjects.map((p) => p.id.toString());

        // If IDs are the same, don't update to avoid unnecessary re-renders
        if (idsArrayEqual(currentIds, fetchedIds)) {
          return prev;
        }

        return fetchedProjects;
      });

      setTempSelectedProjects((prev) => {
        const currentIds = prev.map((p) => p.id.toString());
        const fetchedIds = fetchedProjects.map((p) => p.id.toString());

        if (idsArrayEqual(currentIds, fetchedIds)) {
          return prev;
        }

        return fetchedProjects;
      });
    }
  }, [fetchedProjects, multiple]); // can't add value to deps

  // Use tRPC to search projects with React Query
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = trpc.project.searchProjects.useQuery(
    {
      query: debouncedQuery,
      limit: 20,
    },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        devLog('searchProjects', data);
        return data;
      },
    },
  );

  const handleProjectSelect = (project: IProject) => {
    if (multiple) {
      // 多选模式下切换选中状态
      setTempSelectedProjects((prev) => {
        const isAlreadySelected = prev.some((p) => p.id === project.id);
        if (isAlreadySelected) {
          return prev.filter((p) => p.id !== project.id);
        } else {
          // Check if maximum 10 projects limit is reached
          if (prev.length >= 10) {
            alert('Maximum 10 project donators allowed');
            return prev;
          }
          return [...prev, project];
        }
      });
    } else {
      setSelectedProjects([project]);
      onChange(project.id.toString(), project);
      setIsModalOpen(false);
    }
  };

  const handleConfirmSelection = useCallback(() => {
    if (multiple) {
      setSelectedProjects(tempSelectedProjects);
      const projectIds = tempSelectedProjects.map((p) => p.id.toString());
      onChange(projectIds, tempSelectedProjects);
      setIsModalOpen(false);
    }
  }, [multiple, tempSelectedProjects, onChange]);

  const handleRemoveProject = (projectId: number) => {
    if (multiple) {
      const updatedProjects = selectedProjects.filter(
        (p) => p.id !== projectId,
      );
      setSelectedProjects(updatedProjects);
      const projectIds = updatedProjects.map((p) => p.id.toString());
      onChange(projectIds, updatedProjects);
    }
  };

  const isProjectSelected = (projectId: number) => {
    if (multiple) {
      return tempSelectedProjects.some((p) => p.id === projectId);
    }
    return false;
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    if (multiple) {
      setTempSelectedProjects([...selectedProjects]);
    }
  }, [multiple, selectedProjects]);

  const handleModalOpen = useCallback(() => {
    if (!disabled) {
      // Use setTimeout to ensure modal opens after any potential validation events
      setTimeout(() => {
        setIsModalOpen(true);
        if (multiple) {
          setTempSelectedProjects([...selectedProjects]);
        }
      }, 0);
    }
  }, [disabled, multiple, selectedProjects]);

  const allProjects = searchResults?.published.items || [];

  // If N/A is selected, show NADisplay component
  if (allowNA && isNASelected) {
    return (
      <div className="relative w-full">
        <NADisplay onClear={clearNA} label={naLabel} />
        {error && <div className="mt-1 text-[13px] text-red-500">{error}</div>}
      </div>
    );
  }

  return (
    <>
      {/* Input Field */}
      <div className="relative w-full">
        <div className="flex min-h-[42px] w-full flex-wrap items-center gap-[8px] py-[4px]">
          {/* Main input container with border */}
          <div
            className={`flex min-h-[42px] flex-1 cursor-pointer items-center rounded-[8px] px-[10px] ${
              disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleModalOpen();
            }}
            onMouseDown={(e) => {
              // Prevent focus change which might trigger validation
              e.preventDefault();
            }}
          >
            {/* Selected projects or placeholder */}
            <div className="flex flex-1 items-center gap-[10px]">
              {multiple && isLoadingProjects ? (
                <>
                  {(selectedProjects || []).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-[20px] w-[60px] rounded-sm"
                    />
                  ))}
                </>
              ) : multiple && selectedProjects.length > 0 ? (
                <div className="flex flex-wrap items-center gap-[10px]">
                  {selectedProjects.map((project) => (
                    <SelectedProjectChip
                      key={project.id}
                      project={project}
                      onRemove={() => handleRemoveProject(project.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center">
                  <SearchIcon size={16} className="mr-2 text-black/60" />
                  <span
                    className={cn(
                      'text-[13px]',
                      (!multiple && selectedProjects.length > 0) || value
                        ? 'text-black font-[600]'
                        : 'text-black/70 font-[400]',
                    )}
                  >
                    {(!multiple && selectedProjects.length > 0 ? (
                      <SingleProjectName project={selectedProjects[0]} />
                    ) : null) || placeholder}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Plus button - only show when there are selected projects in multiple mode */}
          {multiple && selectedProjects.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleModalOpen();
              }}
              onMouseDown={(e) => {
                // Prevent focus change which might trigger validation
                e.preventDefault();
              }}
              disabled={disabled}
              className="flex size-[18px] items-center justify-center"
            >
              <PlusSquareOutlineIcon size={18} />
            </button>
          )}

          {/* N/A Button - show when allowNA is true */}
          {allowNA && (
            <NAButton
              onClick={() => {
                selectNA();
                if (onBlur) {
                  onBlur();
                }
              }}
              disabled={disabled}
            >
              {naLabel}
            </NAButton>
          )}
        </div>
        {error && <div className="mt-1 text-[13px] text-red-500">{error}</div>}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        debouncedQuery={debouncedQuery}
        tempSelectedProjects={tempSelectedProjects}
        onTempSelectedProjectsChange={setTempSelectedProjects}
        onConfirmSelection={handleConfirmSelection}
        onProjectSelect={handleProjectSelect}
        isProjectSelected={isProjectSelected}
        isLoading={isLoading}
        isFetching={isFetching}
        allProjects={allProjects}
        multiple={multiple}
        itemLabel={itemLabel}
        searchModalTitle={searchModalTitle}
        columnName={columnName}
      />
    </>
  );
};

const SelectedProjectTag: React.FC<{
  project: IProject;
  onRemove?: () => void;
}> = ({ project, onRemove }) => {
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

// Single project name component for single select mode
const SingleProjectName: React.FC<{ project: IProject }> = ({ project }) => {
  const { projectName } = useProjectItemValue(project);
  return <>{projectName || ''}</>;
};

// Input Field 中的选中项目标签
const SelectedProjectChip: React.FC<{
  project: IProject;
  onRemove: () => void;
}> = ({ project, onRemove }) => {
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

export default React.memo(ProjectSearchSelector);
export { SelectedProjectTag };
