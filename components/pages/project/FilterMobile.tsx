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

type FilterSection = 'categories' | 'locations' | 'tags';

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

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('categories');
    params.delete('locations');
    params.delete('tags');
    params.delete('type');
    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
    setIsOpen(false);
  };

  const hasActiveFilters =
    currentFilters.categories.length > 0 ||
    currentFilters.locations.length > 0 ||
    currentFilters.tags.length > 0;

  // Custom checkbox component matching the design
  const CustomCheckbox = ({ checked }: { checked: boolean }) => {
    if (checked) {
      return <CheckSquareIcon width={24} height={24} className="text-black" />;
    }
    return <SquareIcon width={24} height={24} className="text-black/20" />;
  };

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <g clipPath="url(#clip0_4150_3591)">
                  <path
                    d="M15.625 4.375L4.375 15.625"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.625 15.625L4.375 4.375"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4150_3591">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
                <button
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
                </button>

                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-[10px] flex h-[28px] items-center justify-center gap-[5px] py-[4px]"
                  >
                    <span className="font-['Open_Sans'] text-[13px] font-semibold text-black/50">
                      Clear All Filters
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <g opacity="0.4" clipPath="url(#clip0_4150_4830)">
                        <path
                          d="M12.5 7.5L7.5 12.5"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.5 7.5L12.5 12.5"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_4150_4830">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
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
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.delete(activeSection);
                        router.push(
                          `/projects${
                            params.toString() ? `?${params.toString()}` : ''
                          }`,
                        );
                      }}
                      className="text-[13px] font-normal text-black/50"
                    >
                      Clear this filter
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
