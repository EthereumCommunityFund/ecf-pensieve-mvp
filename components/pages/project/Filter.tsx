'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaretDownIcon,
  CheckSquareIcon,
  FunnelSimpleIcon,
  SquareIcon,
} from '@/components/icons';
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
  const CustomCheckbox = ({ checked }: { checked: boolean }) => {
    if (checked) {
      return <CheckSquareIcon width={24} height={24} className="text-black" />;
    }
    return <SquareIcon width={24} height={24} className="text-black/20" />;
  };

  // 添加自定义滚动条样式类
  const scrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#E1E1E1 transparent',
  };

  // Webkit 滚动条样式
  const webkitScrollbarClass = 'custom-scrollbar';

  return (
    <div className="w-full ">
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="mb-4 text-center">
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-[13px] text-black/50 hover:text-black/70"
          >
            Clear All Filters
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <g opacity="0.4" clipPath="url(#clip0_4150_4830)">
                <path
                  d="M11.25 6.75L6.75 11.25"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.75 6.75L11.25 11.25"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_4150_4830">
                  <rect width="18" height="18" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      )}

      {/* Sub-category Filter */}
      <div className="py-4">
        <div className="mb-2.5 flex h-[30px] items-center justify-between border-b border-black/10 px-0 py-1.5">
          <div className="flex items-center gap-1.5">
            <FunnelSimpleIcon
              width={20}
              height={20}
              className="text-black/60"
            />
            <h4 className="text-[14px] font-semibold text-black/60">
              Sub-category
            </h4>
          </div>
          {currentFilters.categories.length > 0 && (
            <span className="mr-0 flex h-[18px] min-w-[20px] items-center justify-center rounded-[2px] bg-[#1E1E1E] px-1.5 text-[13px] font-semibold text-white">
              {currentFilters.categories.length}
            </span>
          )}
        </div>
        {currentFilters.categories.length > 0 && (
          <div className="mb-2.5 text-right">
            <button
              onClick={() => clearFilter('categories')}
              className="inline-flex items-center gap-1.5 text-[13px] text-black/50 hover:text-black/70"
            >
              Clear this filter
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <g opacity="0.4" clipPath="url(#clip0_4150_4830)">
                  <path
                    d="M11.25 6.75L6.75 11.25"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.75 6.75L11.25 11.25"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4150_4830">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        )}

        <p className="mb-4 text-[12px] text-black/50">
          There are {AllCategories.length} sub-categories
        </p>

        <div className="relative">
          <div
            className={`space-y-[5px] overflow-y-auto pr-2 ${webkitScrollbarClass} ${
              expandedSections.categories ? 'max-h-[365px]' : 'max-h-[180px]'
            }`}
            style={scrollbarStyles}
          >
            {AllCategories.slice(
              0,
              expandedSections.categories ? undefined : INITIAL_ITEMS_COUNT,
            ).map((category, index) => {
              const isSelected = currentFilters.categories.includes(
                category.value,
              );
              return (
                <label
                  key={category.value}
                  className={`flex h-[32px] cursor-pointer items-center justify-between rounded-[5px] px-2 ${
                    isSelected ? '' : index === 0 ? 'bg-[#EBEBEB]' : ''
                  } hover:bg-[#EBEBEB]/60`}
                  onClick={() =>
                    handleFilterChange(
                      'categories',
                      category.value,
                      !isSelected,
                    )
                  }
                >
                  <span
                    className={`text-[14px] ${isSelected ? 'font-semibold text-black' : 'text-black/80'}`}
                  >
                    {category.label}
                  </span>
                  <CustomCheckbox checked={isSelected} />
                </label>
              );
            })}
          </div>
        </div>

        {AllCategories.length > INITIAL_ITEMS_COUNT && (
          <button
            onClick={() => toggleExpanded('categories')}
            className="mt-2.5 flex h-[18px] w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-black/50 hover:text-black/70"
          >
            <span>{expandedSections.categories ? 'Show Less' : 'Expand'}</span>
            <CaretDownIcon
              width={16}
              height={16}
              className={`transition-transform ${
                expandedSections.categories ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Location Filter */}
      <div className=" py-4">
        <div className="mb-2.5 flex h-[30px] items-center justify-between border-b border-black/10 px-0 py-1.5">
          <div className="flex items-center gap-1.5">
            <FunnelSimpleIcon
              width={20}
              height={20}
              className="text-black/60"
            />
            <h4 className="text-[14px] font-semibold text-black/60">
              Location
            </h4>
          </div>
          {currentFilters.locations.length > 0 && (
            <span className="mr-0 flex h-[18px] min-w-[20px] items-center justify-center rounded-[2px] bg-[#1E1E1E] px-1.5 text-[13px] font-semibold text-white">
              {currentFilters.locations.length}
            </span>
          )}
        </div>
        {currentFilters.locations.length > 0 && (
          <div className="mb-2.5 text-right">
            <button
              onClick={() => clearFilter('locations')}
              className="inline-flex items-center gap-1.5 text-[13px] text-black/50 hover:text-black/70"
            >
              Clear this filter
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <g opacity="0.4" clipPath="url(#clip0_4150_4830)">
                  <path
                    d="M11.25 6.75L6.75 11.25"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.75 6.75L11.25 11.25"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4150_4830">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        )}

        <div className="relative">
          <div
            className={`space-y-[5px] overflow-y-auto pr-2 ${webkitScrollbarClass} ${
              expandedSections.locations ? 'max-h-[365px]' : 'max-h-[180px]'
            }`}
            style={scrollbarStyles}
          >
            {locations
              .slice(
                0,
                expandedSections.locations ? undefined : INITIAL_ITEMS_COUNT,
              )
              .map((location) => {
                const isSelected = currentFilters.locations.includes(location);
                return (
                  <label
                    key={location}
                    className="flex h-[32px] cursor-pointer items-center justify-between rounded-[5px] px-2 hover:bg-[#EBEBEB]/60"
                    onClick={() =>
                      handleFilterChange('locations', location, !isSelected)
                    }
                  >
                    <span
                      className={`text-[14px] ${isSelected ? 'font-semibold text-black' : 'text-black/80'}`}
                    >
                      {location}
                    </span>
                    <CustomCheckbox checked={isSelected} />
                  </label>
                );
              })}
          </div>
        </div>

        {locations.length > INITIAL_ITEMS_COUNT && (
          <button
            onClick={() => toggleExpanded('locations')}
            className="mt-2.5 flex h-[18px] w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-black/50 hover:text-black/70"
          >
            <span>{expandedSections.locations ? 'Show Less' : 'Expand'}</span>
            <CaretDownIcon
              width={16}
              height={16}
              className={`transition-transform ${
                expandedSections.locations ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
