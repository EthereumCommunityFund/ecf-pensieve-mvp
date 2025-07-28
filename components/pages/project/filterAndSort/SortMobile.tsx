'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaretDownIcon,
  CheckmarkIcon,
  CloseIcon,
  SortDescendingIcon,
} from '@/components/icons';

import { CATEGORY_MAP, SORT_OPTIONS, type SortOption } from './types';

export default function ProjectSortMobile() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 grow items-center justify-between rounded-[5px] border border-black/10 bg-white p-[10px]"
      >
        <div className="flex items-center gap-[5px]">
          <SortDescendingIcon width={20} height={20} className="text-black" />
          <span className="font-['Open_Sans'] text-[14px] font-semibold text-black">
            {getButtonLabel()}
          </span>
        </div>
        <CaretDownIcon width={16} height={16} className="text-black" />
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
                Sort List
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex size-[30px] items-center justify-center rounded-[4px] bg-white p-[5px]"
            >
              <CloseIcon width={20} height={20} className="text-black" />
            </button>
          </div>

          {/* Sort Options List */}
          <div className="flex-1 overflow-y-auto px-[14px]">
            <div className="flex flex-col gap-[20px] py-[14px]">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="flex flex-col gap-[8px]">
                  <p className="font-['Open_Sans'] text-[13px] font-semibold text-black/30">
                    {CATEGORY_MAP[category] || category}
                  </p>
                  <div className="flex flex-col gap-[5px]">
                    {options.map((option) => {
                      const isSelected = currentSort === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSortSelect(option.value)}
                          className={`flex h-[34px] items-center justify-between rounded-[4px] px-[8px] py-[4px] font-['Open_Sans'] text-[14px] font-normal ${
                            isSelected
                              ? 'bg-[#EBEBEB] text-black'
                              : 'bg-white text-black/80'
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
    </>
  );
}
