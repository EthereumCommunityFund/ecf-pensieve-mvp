'use client';

import { cn, Skeleton } from '@heroui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import NAButton from '@/components/base/NAButton';
import NADisplay from '@/components/base/NADisplay';
import { PlusSquareOutlineIcon, SearchIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { NA_VALUE } from '@/constants/naSelection';
import { useNASelection } from '@/hooks/useNASelection';
import { useProjectsByIds } from '@/hooks/useProjectsByIds';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { idsArrayEqual } from '@/utils/formHelpers';
import {
  extractProjectIds,
  getSingleSelectValue,
  isLegacyStringValue,
  isNumericProjectId,
} from '@/utils/item';

import SearchModal from './SearchModal';
import SelectedProjectChip from './SelectedProjectChip';
import SingleProjectName from './SingleProjectName';

// Component for rendering single-select display content
interface SingleSelectDisplayProps {
  value: string | number | Array<string | number> | undefined;
  selectedProjects: IProject[];
  isLoadingProjects: boolean;
  placeholder: React.ReactNode;
}

const SingleSelectDisplay: React.FC<SingleSelectDisplayProps> = ({
  value,
  selectedProjects,
  isLoadingProjects,
  placeholder,
}) => {
  const singleValue = getSingleSelectValue(value);

  // Loading state for numeric project ID
  if (isLoadingProjects && isNumericProjectId(singleValue)) {
    return <Skeleton className="h-[16px] w-[100px] rounded-sm" />;
  }

  // Display selected project
  if (selectedProjects.length > 0) {
    return <SingleProjectName project={selectedProjects[0]} />;
  }

  // Display legacy string value
  if (isLegacyStringValue(singleValue)) {
    return <span className="font-[600] text-black">{singleValue}</span>;
  }

  // Display placeholder
  return <>{placeholder}</>;
};

interface ProjectSearchSelectorProps {
  value?: string | number | Array<string | number>; // project id(s) or legacy project name(s)
  onChange: (
    value: string | number | Array<string | number>,
    projectData?: IProject | IProject[],
  ) => void;
  onBlur?: () => void; // Optional onBlur handler for form integration
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  columnName?: string;
  multiple?: boolean;
  allowNA?: boolean;
  naLabel?: string;
  itemKey: IPocItemKey;
  searchModalTitle?: string;
}

const ProjectSearchSelector: React.FC<ProjectSearchSelectorProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  placeholder = 'Search or select organization',
  multiple = false,
  allowNA = false,
  naLabel = NA_VALUE,
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

  // Convert value to string format for useNASelection
  const naValue = useMemo(() => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.map((v) => String(v));
    }
    return String(value);
  }, [value]);

  const naOnChange = useCallback(
    (newValue: string | string[]) => {
      // Convert back to original format
      if (Array.isArray(newValue)) {
        onChange(newValue.map((v) => (v === NA_VALUE ? v : Number(v) || v)));
      } else {
        onChange(
          newValue === NA_VALUE ? newValue : Number(newValue) || newValue,
        );
      }
    },
    [onChange],
  );

  const { isNASelected, selectNA, clearNA } = useNASelection(
    naValue,
    naOnChange,
    multiple,
  );

  const itemLabel = useMemo(() => {
    return AllItemConfig[itemKey]?.label;
  }, [itemKey]);

  // Use hook to fetch project data by IDs
  // Memoize projectIds to avoid unnecessary re-renders
  const projectIds = useMemo<(string | number)[]>(() => {
    if (value === NA_VALUE) return [];

    // For multiple select, use extractProjectIds directly
    if (multiple) {
      return extractProjectIds(value);
    }

    // For single select, get the single value and extract project IDs
    const singleValue = getSingleSelectValue(value);
    return extractProjectIds(singleValue);
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
    } else if (!isLoadingProjects && projectIds.length === 0) {
      // Clear selected projects if no projectIds and not loading
      setSelectedProjects([]);
      setTempSelectedProjects([]);
    }
  }, [fetchedProjects, multiple, value, isLoadingProjects, projectIds.length]); // Added necessary dependencies

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
                    {!multiple ? (
                      <SingleSelectDisplay
                        value={value}
                        selectedProjects={selectedProjects}
                        isLoadingProjects={isLoadingProjects}
                        placeholder={placeholder}
                      />
                    ) : (
                      placeholder
                    )}
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

export default React.memo(ProjectSearchSelector);

// Re-export SelectedProjectTag for external use
export { SelectedProjectTag } from './SelectedProjectTag';
