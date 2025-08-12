'use client';

import Link from 'next/link';

import { ProjectTagList } from '@/components/biz/search/ProjectTagList';
import { SEARCH_CONFIG } from '@/constants/searchConfig';
import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';
import { highlightSearchText } from '@/utils/searchHighlight';

interface SearchResultItemProps {
  project: IProject;
  query: string;
  isPublished: boolean;
  onClose: () => void;
}

export default function SearchResultItem({
  project,
  query,
  isPublished,
  onClose,
}: SearchResultItemProps) {
  const { logoUrl, projectName, tagline, getItemValue } =
    useProjectItemValue(project);

  const displayName = projectName;
  const displayDescription = tagline || getItemValue('mainDescription' as any);
  const displayLogo = logoUrl;
  const projectTags = project.tags || [];

  const projectUrl = isPublished
    ? `/project/${project.id}`
    : `/project/pending/${project.id}`;

  return (
    <Link href={projectUrl} onClick={onClose}>
      <div className="cursor-pointer py-3 transition-colors hover:bg-gray-50">
        <div className="flex items-start gap-3">
          {/* Project Icon */}
          <div className="size-10 shrink-0 overflow-hidden rounded-md border border-gray-200">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt={displayName}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-gray-100">
                <span className="text-sm font-semibold text-gray-500">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1">
              <h4 className="truncate text-sm font-semibold text-gray-900">
                {highlightSearchText(displayName, query)}
              </h4>
            </div>
            <div className="line-clamp-2 text-sm text-gray-600 opacity-70">
              {displayDescription || 'No description available'}
            </div>
            {/* Display matching tags with highlighting */}
            {projectTags.length > 0 && (
              <div className="mt-2">
                <ProjectTagList
                  tags={projectTags}
                  query={query}
                  maxDisplay={SEARCH_CONFIG.MAX_DISPLAYED_TAGS}
                  className="flex-wrap"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
