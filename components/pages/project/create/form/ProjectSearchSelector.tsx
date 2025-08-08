'use client';

import { Image, Skeleton } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/base';
import { calcTransparentScore } from '@/components/biz/project/TransparentScore';
import {
  PlusSquareOutlineIcon,
  SearchIcon,
  ShieldStarIcon,
} from '@/components/icons';
import { XCircleSolidIcon } from '@/components/icons/XCircle';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { useProjectsByIds } from '@/hooks/useProjectsByIds';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';
import { idsArrayEqual } from '@/utils/formHelpers';

import TooltipWithQuestionIcon from './TooltipWithQuestionIcon';

interface ProjectSearchSelectorProps {
  value?: string | string[]; // project name/names or custom name/names
  onChange: (
    value: string | string[],
    projectData?: IProject | IProject[],
  ) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  columnName?: string;
  multiple?: boolean; // 是否启用多选模式
}

interface SearchProjectItemProps {
  project: IProject;
  onSelect: (project: IProject, name: string) => void;
  isSelected?: boolean;
  multiple?: boolean;
}

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
    onSelect(project, projectName);
  }, [onSelect, project, projectName]);

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
  disabled = false,
  error,
  placeholder = 'Search or select organization',
  multiple = false,
  columnName = 'Organization/Program',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedProjects, setSelectedProjects] = useState<IProject[]>([]);
  const [tempSelectedProjects, setTempSelectedProjects] = useState<IProject[]>(
    [],
  );

  // Use hook to fetch project data by IDs in multiple mode
  // Memoize projectIds to avoid unnecessary re-renders
  const projectIds = useMemo(() => {
    return multiple && Array.isArray(value) ? value : [];
  }, [multiple, value]);

  const { projects: fetchedProjects, isLoading: isLoadingProjects } =
    useProjectsByIds(projectIds, {
      enabled: multiple && projectIds.length > 0,
    });

  // Initialize selected projects with protection against unnecessary resets
  useEffect(() => {
    if (!multiple) {
      // Single select mode - keep original logic
      if (typeof value === 'string') {
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
  }, [fetchedProjects, multiple, value]);

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

  const handleProjectSelect = (project: IProject, projectName: string) => {
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
      // 单选模式保持原有逻辑
      setSelectedProjects([project]);
      onChange(projectName, project);
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
    // 在多选模式下重置临时选择
    if (multiple) {
      setTempSelectedProjects([...selectedProjects]);
    }
    // 不清空搜索状态，保留用户的搜索结果
  }, [multiple, selectedProjects]);

  const handleModalOpen = () => {
    if (!disabled) {
      setIsModalOpen(true);
      // 在多选模式下初始化临时选择
      if (multiple) {
        setTempSelectedProjects([...selectedProjects]);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleModalClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, handleModalClose]);

  const allProjects = searchResults?.published.items || [];

  return (
    <>
      {/* Input Field */}
      <div className="relative w-full">
        <div className="flex min-h-[42px] w-full flex-wrap items-center">
          {/* Main input container with border */}
          <div
            className={`flex min-h-[42px] flex-1 cursor-pointer items-center rounded-[8px] px-[10px] ${
              disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={handleModalOpen}
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
                  <span className="text-[13px] font-normal text-black/60">
                    {(!multiple && typeof value === 'string' ? value : null) ||
                      placeholder}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Plus button - only show when there are selected projects in multiple mode */}
          {multiple && selectedProjects.length > 0 && (
            <button
              onClick={handleModalOpen}
              disabled={disabled}
              className="ml-[10px] flex size-[18px] items-center justify-center"
            >
              <PlusSquareOutlineIcon size={18} />
            </button>
          )}
        </div>
        {error && <div className="mt-1 text-[13px] text-red-500">{error}</div>}
      </div>

      {/* Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-[510px] rounded-[10px] border-2 border-[rgb(225,225,225)] bg-white shadow-none">
            {/* Modal Header */}
            <div className="flex h-[44px] items-center justify-between px-[14px]">
              <div className="flex items-center gap-[10px]">
                <div className="flex items-center gap-[10px] rounded-[5px] border-none bg-[rgb(245,245,245)] px-[10px] py-[4px]">
                  <span className="text-[14px] font-semibold text-black">
                    Funding Received (Grants):
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
                  onClick={handleModalClose}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                      setTempSelectedProjects((prev) =>
                        prev.filter((p) => p.id !== project.id),
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
                      onSelect={handleProjectSelect}
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
              <div className="flex justify-end border-t border-black/10 bg-white/40  px-[14px] pb-[14px] pt-[10px] backdrop-blur-[10px] ">
                <button
                  onClick={handleConfirmSelection}
                  className="flex h-[36px] items-center justify-center rounded-[5px] bg-[rgb(74,74,74)] px-[10px] py-[8px] font-['Ubuntu_Mono'] text-[14px] font-bold text-white hover:bg-[rgb(64,64,64)]"
                >
                  Confirm Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SelectedProjectTag: React.FC<{
  project: IProject;
  onRemove: () => void;
}> = ({ project, onRemove }) => {
  const { projectName } = useProjectItemValue(project);

  return (
    <div className="flex h-[28px] items-center gap-[5px] rounded-[5px] border border-black/20 px-[10px] py-[4px]">
      <span className="text-[13px] font-normal text-black">{projectName}</span>
      <button onClick={onRemove} className="flex items-center justify-center">
        <XCircleSolidIcon />
      </button>
    </div>
  );
};

// Input Field 中的选中项目标签
const SelectedProjectChip: React.FC<{
  project: IProject;
  onRemove: () => void;
}> = ({ project, onRemove }) => {
  const { projectName } = useProjectItemValue(project);

  return (
    <div className="flex h-[20px] items-center gap-[5px]">
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
