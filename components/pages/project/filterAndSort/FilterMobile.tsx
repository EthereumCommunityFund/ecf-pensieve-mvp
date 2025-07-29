'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaretDownIcon,
  CircleXIcon,
  CloseIcon,
  FunnelSimpleIcon,
} from '@/components/icons';
import { AllCategories } from '@/constants/category';

import { CustomCheckbox } from './CustomCheckbox';
import { type FilterSection, type FilterState } from './types';
import {
  hasActiveFilters as checkHasActiveFilters,
  clearFilterParams,
  parseFilterStateFromURL,
  updateFilterParams,
} from './utils';

export default function ProjectFilterMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<FilterSection | null>(
    null,
  );
  const router = useRouter();
  const searchParams = useSearchParams();

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
    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const clearAllFilters = () => {
    const params = clearFilterParams(searchParams);
    router.replace(
      `/projects${params.toString() ? `?${params.toString()}` : ''}`,
    );
    setIsOpen(false);
  };

  const hasActiveFilters = checkHasActiveFilters(currentFilters);

  const getSectionLabel = (section: FilterSection): string => {
    switch (section) {
      case 'categories':
        return 'Category';
      case 'locations':
        return 'Location';
      case 'tags':
        return 'Tags';
    }
  };

  const getSectionItems = (section: FilterSection) => {
    switch (section) {
      case 'categories':
        return AllCategories.map((cat) => ({
          value: cat.value,
          label: cat.label,
        }));
      case 'locations':
        return locations.map((loc) => ({ value: loc, label: loc }));
      case 'tags':
        return []; // Reserved for future
    }
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex h-10 items-center gap-[5px] rounded-[5px] border border-none border-black/10 px-[14px] py-[5px]"
      >
        <FunnelSimpleIcon width={20} height={20} className="text-black" />
        <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
          Filter
        </span>
        {hasActiveFilters && (
          <div className="size-2 rounded-full bg-[#68C6AC]" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Drawer */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-[20px] bg-white transition-transform">
          {/* Drag Handle */}
          <div className="flex justify-center py-[14px]">
            <div className="h-[8px] w-[40px] rounded-[4px] bg-[#F5F5F5]" />
          </div>

          {/* Header */}
          <div className="flex h-[58px] items-center justify-between border-b border-black/10 px-[14px]">
            {activeSection === null ? (
              <button className="flex h-5 items-center gap-[5px] rounded-[5px] border-none px-2">
                <FunnelSimpleIcon
                  width={20}
                  height={20}
                  className="text-black"
                />
                <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
                  Filter
                </span>
                {hasActiveFilters && (
                  <div className="size-2 rounded-full bg-[#68C6AC]" />
                )}
              </button>
            ) : (
              <button
                onClick={() => setActiveSection(null)}
                className="flex h-[28px] items-center gap-[5px] rounded-[5px] border-none px-[8px] py-[4px]"
              >
                <CaretDownIcon
                  width={20}
                  height={20}
                  className="rotate-90 text-black"
                />
                <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
                  Back
                </span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex size-[30px] items-center justify-center rounded-[4px] bg-white p-[5px]"
            >
              <CloseIcon width={20} height={20} className="text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-[14px]">
            {activeSection === null ? (
              // Main Filter List
              <div className="flex flex-col gap-[10px]">
                {/* Category Section */}
                <button
                  onClick={() => setActiveSection('categories')}
                  className="flex min-h-[39px]  items-center gap-[5px] rounded-[5px] border border-black/10 p-[10px]"
                >
                  <div className="flex w-full flex-1 flex-col items-start">
                    <div className="flex items-center gap-[5px]">
                      <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
                        Category
                      </span>
                      {currentFilters.categories.length > 0 && (
                        <div className="size-2 rounded-full bg-[#68C6AC]" />
                      )}
                    </div>
                    {currentFilters.categories.length > 0 && (
                      <div className="flex flex-wrap gap-[5px]">
                        <span className="text-left font-['Open_Sans'] text-[10px] font-normal text-black/50">
                          {currentFilters.categories
                            .map(
                              (cat) =>
                                AllCategories.find((c) => c.value === cat)
                                  ?.label || cat,
                            )
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <CaretDownIcon
                    width={16}
                    height={16}
                    className="-rotate-90 text-black"
                  />
                </button>

                {/* Location Section */}
                {/* <button
                  onClick={() => setActiveSection('locations')}
                  className="flex min-h-[39px] items-center gap-[5px] rounded-[5px] border border-black/10 p-[10px]"
                >
                  <div className="flex w-full flex-1 flex-col items-start">
                    <div className="flex items-center gap-[5px]">
                      <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
                        Location
                      </span>
                      {currentFilters.locations.length > 0 && (
                        <div className="size-2 rounded-full bg-[#68C6AC]" />
                      )}
                    </div>
                    {currentFilters.locations.length > 0 && (
                      <div className="flex flex-wrap gap-[5px]">
                        <span className="font-['Open_Sans'] text-[10px] font-normal text-black/50">
                          {currentFilters.locations.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <CaretDownIcon
                    width={16}
                    height={16}
                    className="-rotate-90 text-black"
                  />
                </button> */}

                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-[10px] flex h-[28px] items-center justify-center gap-[5px] py-[4px]"
                  >
                    <span className="font-['Open_Sans'] text-[13px] font-semibold text-black/50">
                      Clear All Filters
                    </span>
                    <CircleXIcon
                      width={20}
                      height={20}
                      className="text-black"
                    />
                  </button>
                )}
              </div>
            ) : (
              // Section Detail View
              <div className="flex flex-col">
                {/* Back Button and Clear This Filter */}
                <div className="mb-[10px] flex items-center justify-between">
                  <button
                    onClick={() => setActiveSection(null)}
                    className="flex items-center gap-[5px]"
                  >
                    <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
                      {getSectionLabel(activeSection)}
                    </span>
                  </button>
                  {currentFilters[activeSection].length > 0 && (
                    <button
                      onClick={() => {
                        const params = clearFilterParams(
                          searchParams,
                          activeSection,
                        );
                        router.push(
                          `/projects${
                            params.toString() ? `?${params.toString()}` : ''
                          }`,
                        );
                      }}
                      className="flex items-center gap-[5px] text-[13px] font-normal text-black/50"
                    >
                      Clear this filter
                      <CircleXIcon
                        width={18}
                        height={18}
                        className="text-black"
                      />
                    </button>
                  )}
                </div>

                {/* Section Info */}
                {activeSection === 'categories' && (
                  <p className="mb-[14px] font-['Open_Sans'] text-[12px] font-normal text-black/50">
                    There are {AllCategories.length} sub-categories
                  </p>
                )}

                {/* Options List */}
                <div className="flex flex-col gap-[5px]">
                  {getSectionItems(activeSection).map((item) => {
                    const isSelected = currentFilters[activeSection].includes(
                      item.value,
                    );
                    return (
                      <button
                        key={item.value}
                        onClick={() =>
                          handleFilterChange(
                            activeSection,
                            item.value,
                            !isSelected,
                          )
                        }
                        className={`flex h-[32px] items-center justify-between rounded-[5px] px-[8px] py-[4px] ${
                          isSelected
                            ? 'bg-[#EBEBEB]'
                            : 'bg-white hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span
                          className={`font-['Open_Sans'] text-[14px] ${
                            isSelected
                              ? 'font-semibold text-black'
                              : 'font-normal text-black/80'
                          }`}
                        >
                          {item.label}
                        </span>
                        <CustomCheckbox checked={isSelected} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
