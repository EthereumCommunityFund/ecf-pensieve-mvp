'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AllCategories } from '@/constants/category';

interface FilterState {
  categories: string[];
  locations: string[];
  tags: string[]; // Reserved for future
}

export default function ProjectFilter() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get locations from backend
  // TODO: Uncomment when getLocations API is implemented
  // const { data: locationsData } = trpc.project.getLocations.useQuery();
  // const locations = locationsData || [];

  // Temporary static data for testing
  const locations: string[] = ['Japan', 'China', 'USA'];

  // Parse filter state from URL
  const currentFilters: FilterState = {
    categories:
      searchParams.get('categories')?.split(',').filter(Boolean) || [],
    locations: searchParams.get('locations')?.split(',').filter(Boolean) || [],
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
  };

  const handleFilterChange = (
    type: keyof FilterState,
    value: string,
    checked: boolean,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    let values = [...currentFilters[type]];

    if (checked) {
      if (!values.includes(value)) {
        values.push(value);
      }
    } else {
      values = values.filter((v) => v !== value);
    }

    if (values.length > 0) {
      params.set(type, values.join(','));
    } else {
      params.delete(type);
    }

    // Remove type parameter when filtering
    params.delete('type');

    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const clearFilter = (type: keyof FilterState) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(type);
    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('categories');
    params.delete('locations');
    params.delete('tags');
    params.delete('type');
    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const toggleExpanded = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    currentFilters.categories.length > 0 ||
    currentFilters.locations.length > 0 ||
    currentFilters.tags.length > 0;

  const INITIAL_ITEMS_COUNT = 5;

  // Custom checkbox component matching the design
  const CustomCheckbox = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div
      className={`size-4 rounded-full border ${
        checked ? 'border-black bg-black' : 'border-gray-300 bg-white'
      } flex cursor-pointer items-center justify-center`}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white">
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="mb-4 text-center">
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All Filters
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-40"
            >
              <circle
                cx="7"
                cy="7"
                r="6"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M9 5L5 9M5 5L9 9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Sub-category Filter */}
      <div className="border-t border-gray-200 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8H13M1 4H15M5 12H11"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <h4 className="text-sm font-semibold">Sub-category</h4>
            {currentFilters.categories.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-black px-1 text-[10px] font-medium text-white">
                {currentFilters.categories.length}
              </span>
            )}
          </div>
          {currentFilters.categories.length > 0 && (
            <button
              onClick={() => clearFilter('categories')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear this filter
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <p className="mb-3 text-xs text-gray-400">
          There are {AllCategories.length} sub-categories
        </p>

        <div className="space-y-2">
          {AllCategories.slice(
            0,
            expandedSections.categories ? undefined : INITIAL_ITEMS_COUNT,
          ).map((category) => (
            <label
              key={category.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <CustomCheckbox
                checked={currentFilters.categories.includes(category.value)}
                onChange={(checked) =>
                  handleFilterChange('categories', category.value, checked)
                }
              />
              <span className="text-sm text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>

        {AllCategories.length > INITIAL_ITEMS_COUNT && (
          <button
            onClick={() => toggleExpanded('categories')}
            className="mt-3 flex w-full items-center justify-between text-sm text-gray-600 hover:text-gray-800"
          >
            <span>Expand</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${
                expandedSections.categories ? 'rotate-180' : ''
              }`}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Location Filter */}
      <div className="border-t border-gray-200 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8H13M1 4H15M5 12H11"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <h4 className="text-sm font-semibold">Location</h4>
            {currentFilters.locations.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-black px-1 text-[10px] font-medium text-white">
                {currentFilters.locations.length}
              </span>
            )}
          </div>
          {currentFilters.locations.length > 0 && (
            <button
              onClick={() => clearFilter('locations')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear this filter
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {locations
            .slice(
              0,
              expandedSections.locations ? undefined : INITIAL_ITEMS_COUNT,
            )
            .map((location) => (
              <label
                key={location}
                className="flex cursor-pointer items-center gap-2"
              >
                <CustomCheckbox
                  checked={currentFilters.locations.includes(location)}
                  onChange={(checked) =>
                    handleFilterChange('locations', location, checked)
                  }
                />
                <span className="text-sm text-gray-700">{location}</span>
              </label>
            ))}
        </div>

        {locations.length > INITIAL_ITEMS_COUNT && (
          <button
            onClick={() => toggleExpanded('locations')}
            className="mt-3 flex w-full items-center justify-between text-sm text-gray-600 hover:text-gray-800"
          >
            <span>Expand</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${
                expandedSections.locations ? 'rotate-180' : ''
              }`}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Tags Filter */}
      <div className="border-t border-gray-200 py-4">
        <div className="mb-3 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8H13M1 4H15M5 12H11"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <h4 className="text-sm font-semibold">Tags</h4>
        </div>
        <div>
          <input
            type="text"
            placeholder="tagone"
            disabled
            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
