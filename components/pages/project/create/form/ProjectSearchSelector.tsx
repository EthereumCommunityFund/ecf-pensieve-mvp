'use client';

import { Image, Skeleton } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/base';
import { calcTransparentScore } from '@/components/biz/project/TransparentScore';
import { SearchIcon, ShieldStarIcon } from '@/components/icons';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

import TooltipWithQuestionIcon from './TooltipWithQuestionIcon';

interface ProjectSearchSelectorProps {
  value?: string; // project name or custom name
  onChange: (value: string, projectData?: IProject) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

interface SearchProjectItemProps {
  project: IProject;
  onSelect: (project: IProject, name: string) => void;
}

const SearchProjectItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-[14px] p-[10px]">
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

      {/* Select Button Skeleton */}
      <Skeleton className="h-[24px] w-[50px] rounded-[4px]" />
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
      <Link
        href={`/project/${project.id}`}
        target="_blank"
        key={project.id}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-[14px] transition-colors"
      >
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

        {/* Select Button */}
      </Link>
      <div className="flex shrink-0 items-center">
        <Button
          onPress={onTriggerSelect}
          color="secondary"
          className="h-[24px] min-w-0 border-none bg-[#F5F5F5] px-[8px] text-[13px] font-bold text-black/50"
        >
          Select
        </Button>
      </div>
    </div>
  );
};

const ProjectSearchSelector: React.FC<ProjectSearchSelectorProps> = ({
  onChange,
  disabled = false,
  error,
  placeholder = 'Search or select organization',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const { projectName } = useProjectItemValue(selectedProject);

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
    setSelectedProject(project);
    onChange(projectName, project);
    setIsModalOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // 不清空搜索状态，保留用户的搜索结果
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
  }, [isModalOpen]);

  const allProjects = searchResults?.published.items || [];

  return (
    <>
      {/* Input Field */}
      <div className="relative w-full">
        <div
          className={`flex h-[40px] w-full cursor-pointer items-center rounded-[8px] border-none ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={handleInputClick}
        >
          <div className="flex w-full items-center px-[10px]">
            <SearchIcon size={16} className="mr-2 text-black/60" />
            <span
              className={`flex-1 text-[13px] font-normal ${
                projectName ? 'text-black' : 'text-black/60'
              }`}
            >
              {projectName || placeholder}
            </span>
          </div>
        </div>
        {error && <div className="mt-1 text-[13px] text-red-500">{error}</div>}
      </div>

      {/* Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="max-h-[400px] w-[510px] rounded-[10px] border border-[rgb(225,225,225)] bg-white shadow-none">
            {/* Modal Header */}
            <div className="flex h-[44px] items-center justify-between border-b border-black/10 px-[14px]">
              <div className="flex items-center gap-[10px]">
                <div className="flex items-center gap-[10px] rounded-[5px] border-none bg-[rgb(245,245,245)] px-[10px] py-[4px]">
                  <span className="text-[14px] font-semibold text-black">
                    Funding Received (Grants):
                  </span>
                  <div className="flex items-center gap-[5px] opacity-60">
                    <span className="text-[14px] font-semibold text-[rgb(51,51,51)]">
                      Organization/Program
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

            {/* Search Results */}
            <div className="max-h-[280px] overflow-y-auto">
              {(isLoading || isFetching) && debouncedQuery.length >= 2 ? (
                <div className="flex flex-col gap-[14px] p-[14px]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SearchProjectItemSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              ) : allProjects.length > 0 ? (
                <div className="flex flex-col gap-[14px] p-[14px]">
                  {allProjects.map((project) => (
                    <SearchProjectItem
                      key={project.id}
                      project={project as unknown as IProject}
                      onSelect={handleProjectSelect}
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
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSearchSelector;
