'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface SortOption {
  value: string;
  label: string;
  category: string;
}

const sortOptions: SortOption[] = [
  // By Rank
  { value: 'top-transparent', label: 'Top Transparent', category: 'By Rank' },
  {
    value: 'top-community-trusted',
    label: 'Top Community Trusted',
    category: 'By Rank',
  },
  // By Time
  { value: 'newest', label: 'Newest Projects', category: 'By Time' },
  { value: 'oldest', label: 'Oldest Projects', category: 'By Time' },
  // By Name
  { value: 'a-z', label: 'Order Alphabetically (A→Z)', category: 'By Name' },
  { value: 'z-a', label: 'Order Alphabetically (Z→A)', category: 'By Name' },
  // By Activity
  {
    value: 'most-contributed',
    label: 'Most Contributed',
    category: 'By Activity',
  },
  {
    value: 'less-contributed',
    label: 'Less Contributed',
    category: 'By Activity',
  },
];

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

    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
    setIsExpanded(false); // Close dropdown after selection
  };

  const getButtonLabel = () => {
    if (!currentSort) return 'Sort';
    const option = sortOptions.find((opt) => opt.value === currentSort);
    return option?.label || 'Sort';
  };

  // Group options by category
  const groupedOptions = sortOptions.reduce(
    (acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    },
    {} as Record<string, SortOption[]>,
  );

  const categoryMap: Record<string, string> = {
    'By Rank': 'By Rank:',
    'By Time': 'By Time:',
    'By Name': 'By Name:',
    'By Activity': 'By Activity:',
  };

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g clipPath="url(#clip0_3873_28423)">
              <path
                d="M3.75 10H9.375"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.75 5H14.375"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.75 15H8.125"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.25 13.125L14.375 16.25L17.5 13.125"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.375 16.25V8.75"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_3873_28423">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
            {getButtonLabel()}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className=" px-[14px] pb-[14px]">
          <div className="flex flex-col gap-[20px] pt-[14px]">
            {/* Sort Options */}
            <div className="flex flex-col gap-[10px]">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="flex flex-col gap-[8px]">
                  <p
                    className="font-['Open_Sans'] text-[13px] font-semibold text-black"
                    style={{ opacity: 0.3 }}
                  >
                    {categoryMap[category] || category}
                  </p>
                  <div className="flex flex-col gap-[5px]">
                    {options.map((option) => {
                      const isSelected = currentSort === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSortSelect(option.value)}
                          className={`flex h-[27px] items-center justify-between rounded-[4px] px-[8px] py-[4px] font-['Open_Sans'] text-[14px] font-normal transition-colors ${
                            isSelected
                              ? 'bg-[#EBEBEB] text-black'
                              : 'bg-white text-black hover:bg-[#F5F5F5]'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.5 4.5L6 12L2.5 8.5"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
