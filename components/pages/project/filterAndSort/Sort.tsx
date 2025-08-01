'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaretDownIcon,
  CheckmarkIcon,
  SortDescendingIcon,
} from '@/components/icons';

import { CATEGORY_MAP, SORT_OPTIONS, type SortOption } from './types';

export default function ProjectSort() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current sort value from URL (single value, not array)
  const currentSort = searchParams.get('sort') || '';

  const handleSortSelect = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sortValue === currentSort) {
      // If clicking the same option, deselect it
      params.delete('sort');
    } else {
      // Set new sort value
      params.set('sort', sortValue);
    }

    router.replace(
      `/projects${params.toString() ? `?${params.toString()}` : ''}`,
    );
    setIsExpanded(false); // Close dropdown after selection
  };

  const getButtonLabel = () => {
    if (!currentSort) return 'Sort';
    const option = SORT_OPTIONS.find((opt) => opt.value === currentSort);
    return option?.label || 'Sort';
  };

  // Group options by category
  const groupedOptions = SORT_OPTIONS.reduce(
    (acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    },
    {} as Record<string, SortOption[]>,
  );

  return (
    <div
      className="w-[300px] rounded-[5px] border border-black bg-white"
      style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex h-10 w-full items-center justify-between px-[14px] py-[10px] transition-colors hover:bg-[#E1E1E1] ${
          isExpanded ? '' : 'rounded-[5px]'
        }`}
      >
        <div className="flex items-center gap-[5px]">
          <SortDescendingIcon width={20} height={20} className="text-black" />
          <span className="text-[14px] font-semibold text-black">
            {getButtonLabel()}
          </span>
        </div>
        <CaretDownIcon
          width={16}
          height={16}
          className={`text-black transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className=" px-[14px] pb-[14px]">
          <div className="flex flex-col gap-[20px] pt-[14px]">
            {/* Sort Options */}
            <div className="flex flex-col gap-[10px]">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="flex flex-col gap-[8px]">
                  <p
                    className="text-[13px] font-semibold text-black"
                    style={{ opacity: 0.3 }}
                  >
                    {CATEGORY_MAP[category] || category}
                  </p>
                  <div className="flex flex-col gap-[5px]">
                    {options.map((option) => {
                      const isSelected = currentSort === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSortSelect(option.value)}
                          className={`flex h-[27px] items-center justify-between rounded-[4px] px-[8px] py-[4px] text-[14px] font-normal transition-colors ${
                            isSelected
                              ? 'bg-[#EBEBEB] text-black'
                              : 'bg-white text-black hover:bg-[#F5F5F5]'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <CheckmarkIcon
                              width={16}
                              height={16}
                              className="text-black"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
