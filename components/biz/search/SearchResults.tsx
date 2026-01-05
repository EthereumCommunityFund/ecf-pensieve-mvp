'use client';

import { useRouter } from 'next/navigation';

import type { IProject } from '@/types';

import SearchEmptyState from './SearchEmptyState';
import SearchResultItem from './SearchResultItem';
import SearchResultSkeleton from './SearchResultSkeleton';

interface SearchResultsProps {
  results?: {
    published: {
      items: any[];
      nextCursor?: number;
      totalCount: number;
    };
    unpublished: {
      items: any[];
      nextCursor?: number;
      totalCount: number;
    };
  };
  isLoading: boolean;
  error: any;
  query: string;
  onClose: () => void;
  hidePendingProjects?: boolean;
  resolveProjectHref?: (project: IProject, isPublished: boolean) => string;
}

export default function SearchResults({
  results,
  isLoading,
  error,
  query,
  onClose,
  hidePendingProjects = false,
  resolveProjectHref,
}: SearchResultsProps) {
  const router = useRouter();
  const publishedItems = results?.published.items ?? [];
  const unpublishedItems = hidePendingProjects
    ? []
    : (results?.unpublished.items ?? []);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-3">
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-700 opacity-50">
              Published Projects:
            </h3>
          </div>
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <SearchResultSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Search failed. Please try again.</p>
      </div>
    );
  }

  if (
    !results ||
    (publishedItems.length === 0 && unpublishedItems.length === 0)
  ) {
    return (
      <SearchEmptyState
        query={query}
        onProposeClick={(query) => {
          onClose();
          router.push(`/project/create`);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 p-[14px] py-3">
      {publishedItems.length > 0 && (
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-700 opacity-50">
              Published Projects:
            </h3>
          </div>
          <div className="space-y-1">
            {publishedItems.map((project) => (
              <SearchResultItem
                key={`published-${project.id}`}
                project={project}
                query={query}
                isPublished={true}
                onClose={onClose}
                resolveProjectHref={resolveProjectHref}
              />
            ))}
          </div>
        </div>
      )}

      {unpublishedItems.length > 0 && (
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-700 opacity-50">
              Pending Projects:
            </h3>
          </div>
          <div className="space-y-1">
            {unpublishedItems.map((project) => (
              <SearchResultItem
                key={`unpublished-${project.id}`}
                project={project}
                query={query}
                isPublished={false}
                onClose={onClose}
                resolveProjectHref={resolveProjectHref}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
