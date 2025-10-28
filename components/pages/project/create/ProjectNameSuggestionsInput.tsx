'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Input } from '@/components/base';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

type SearchProjectsOutput = RouterOutputs['project']['searchProjects'];
type PublishedProjectItem = SearchProjectsOutput['published']['items'][number];
type UnpublishedProjectItem =
  SearchProjectsOutput['unpublished']['items'][number];
type SearchProjectItem = PublishedProjectItem | UnpublishedProjectItem;

const hasProjectSnap = (
  project: SearchProjectItem,
): project is PublishedProjectItem => {
  return 'projectSnap' in project && project.projectSnap !== undefined;
};

interface ProjectNameSuggestionsInputProps {
  name: string;
  inputRef?: (instance: HTMLInputElement | null) => void;
  value: string;
  placeholder?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 10;

const getLeadingProjectName = (project: SearchProjectItem): string => {
  const snapItems = hasProjectSnap(project)
    ? (project.projectSnap?.items ?? [])
    : [];
  const nameFromSnap = snapItems.find(
    (item: { key: string; value: unknown }) => item.key === 'name',
  );

  if (typeof nameFromSnap?.value === 'string' && nameFromSnap.value.trim()) {
    return nameFromSnap.value;
  }

  return project.name ?? '';
};

const getProjectUrl = (project: SearchProjectItem): string => {
  if (project.isPublished) {
    return `/project/${project.id}`;
  }
  return `/project/pending/${project.id}`;
};

const ProjectNameSuggestionsInput: React.FC<
  ProjectNameSuggestionsInputProps
> = ({
  name,
  inputRef,
  value,
  placeholder,
  isInvalid,
  isDisabled,
  onChange,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sanitizedValue = typeof value === 'string' ? value : '';
  const trimmedQuery = sanitizedValue.trim();
  const [debouncedQuery] = useDebounce(trimmedQuery, 300);

  const shouldSearch = debouncedQuery.length >= MIN_QUERY_LENGTH && !isDisabled;

  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = trpc.project.searchProjects.useQuery(
    {
      query: debouncedQuery,
      limit: MAX_RESULTS,
    },
    {
      enabled: shouldSearch,
      staleTime: 60 * 1000,
    },
  );

  const suggestions = useMemo(() => {
    if (!searchResults || !shouldSearch) {
      return [];
    }

    const combined: SearchProjectItem[] = [
      ...(searchResults.published?.items ?? []),
      ...(searchResults.unpublished?.items ?? []),
    ];

    const seen = new Set<number>();
    const unique = combined.filter((project) => {
      if (seen.has(project.id)) {
        return false;
      }
      seen.add(project.id);
      return true;
    });

    return unique.slice(0, MAX_RESULTS);
  }, [searchResults, shouldSearch]);

  const showSuggestions =
    isFocused &&
    shouldSearch &&
    (isLoading || isFetching || suggestions.length > 0);

  const handleSuggestionSelect = useCallback((project: SearchProjectItem) => {
    const url = getProjectUrl(project);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="relative">
      <Input
        name={name}
        ref={inputRef}
        value={sanitizedValue}
        placeholder={placeholder}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
      />

      {showSuggestions ? (
        <div className="absolute inset-x-0 top-full z-[1000] mt-1 rounded-[10px] border border-black/10 bg-white shadow-[0px_20px_40px_rgba(15,15,15,0.12)]">
          {isLoading || isFetching ? (
            <div className="px-[20px] py-[8px] text-[14px] font-medium text-black/50">
              Searching projects...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[220px] overflow-y-auto py-1">
              {suggestions.map((project) => {
                const leadingName = getLeadingProjectName(project);
                return (
                  <li
                    key={project.id}
                    className="cursor-pointer px-3 py-2 text-[14px] font-semibold text-black transition-colors hover:bg-black/5"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionSelect(project);
                    }}
                  >
                    {leadingName}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-2 text-[12px] font-medium text-black/50">
              No similar projects found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ProjectNameSuggestionsInput;
