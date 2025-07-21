'use client';

import { useRouter } from 'next/navigation';

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
}

export default function SearchResults({
  results,
  isLoading,
  error,
  query,
  onClose,
}: SearchResultsProps) {
  const router = useRouter();

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
    (results.published.items.length === 0 &&
      results.unpublished.items.length === 0)
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
      {results.published.items.length > 0 && (
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-700 opacity-50">
              Published Projects:
            </h3>
          </div>
          <div className="space-y-1">
            {results.published.items.map((project) => (
              <SearchResultItem
                key={`published-${project.id}`}
                project={project}
                query={query}
                isPublished={true}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      )}

      {results.unpublished.items.length > 0 && (
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-700 opacity-50">
              Pending Projects:
            </h3>
          </div>
          <div className="space-y-1">
            {results.unpublished.items.map((project) => (
              <SearchResultItem
                key={`unpublished-${project.id}`}
                project={project}
                query={query}
                isPublished={false}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
