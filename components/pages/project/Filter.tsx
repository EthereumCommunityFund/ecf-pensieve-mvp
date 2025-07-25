'use client';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AllCategories } from '@/constants/category';

export default function ProjectFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategorySelect = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set('cat', category);
    } else {
      params.delete('cat');
    }

    // Remove type parameter when filtering by category
    params.delete('type');

    router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
    setIsOpen(false);
  };

  const selectedCategory = searchParams.get('cat');

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant="flat"
          size="sm"
          className="flex items-center gap-2 bg-black/5"
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
            >
              <g clipPath="url(#clip0_1285_1257)">
                <path
                  d="M5 11.125H15"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.875 7.375H18.125"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.125 14.875H11.875"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1285_1257">
                  <rect
                    width="20"
                    height="20"
                    fill="white"
                    transform="translate(0 0.5)"
                  />
                </clipPath>
              </defs>
            </svg>
          }
        >
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <div className="flex flex-col gap-1">
          <Button
            variant="light"
            size="sm"
            className={`justify-start ${!selectedCategory ? 'bg-gray-100' : ''}`}
            onPress={() => handleCategorySelect(null)}
          >
            All Categories
          </Button>
          {AllCategories.map((category) => (
            <Button
              key={category.value}
              variant="light"
              size="sm"
              className={`justify-start ${
                selectedCategory === category.value ? 'bg-gray-100' : ''
              }`}
              onPress={() => handleCategorySelect(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
