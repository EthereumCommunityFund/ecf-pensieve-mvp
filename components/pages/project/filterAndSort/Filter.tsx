'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaretDownIcon,
  CircleXIcon,
  FunnelSimpleIcon,
} from '@/components/icons';
import { AllCategories } from '@/constants/category';

import { CustomCheckbox } from './CustomCheckbox';
import { INITIAL_ITEMS_COUNT, type FilterState } from './types';
import {
  hasActiveFilters as checkHasActiveFilters,
  clearFilterParams,
  parseFilterStateFromURL,
  updateFilterParams,
} from './utils';

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
  const currentFilters: FilterState = parseFilterStateFromURL(searchParams);

  const handleFilterChange = (
    type: keyof FilterState,
    value: string,
    checked: boolean,
  ) => {
    const params = updateFilterParams(
      searchParams,
      type,
      value,
      checked,
      currentFilters,
    );
    router.replace(
      `/projects${params.toString() ? `?${params.toString()}` : ''}`,
    );
  };

  const clearFilter = (type: keyof FilterState) => {
    const params = clearFilterParams(searchParams, type);
    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const clearAllFilters = () => {
    const params = clearFilterParams(searchParams);
    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const toggleExpanded = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = checkHasActiveFilters(currentFilters);

  // Webkit scrollbar class
  const webkitScrollbarClass = 'custom-scrollbar';

  // Custom scrollbar styles
  const scrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#E1E1E1 transparent',
  };

  return (
    <div className="flex w-full flex-col gap-[10px]">
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <div className="text-center">
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-[13px] text-black/50 hover:text-black/70"
          >
            Clear All Filters
            <CircleXIcon width={18} height={18} className="text-black" />
          </button>
        </div>
      )}

      {/* Sub-category Filter */}
      <div className="">
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
              <CircleXIcon width={18} height={18} className="text-black" />
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
            {AllCategories.map((category) => {
              const isSelected = currentFilters.categories.includes(
                category.value,
              );
              return (
                <label
                  key={category.value}
                  className={`flex h-[32px] cursor-pointer items-center justify-between rounded-[5px] px-2 hover:bg-[#EBEBEB]/60`}
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
      {/* <div className=" py-4">
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
              <CircleXIcon width={18} height={18} className="text-black" />
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
      </div> */}
    </div>
  );
}
