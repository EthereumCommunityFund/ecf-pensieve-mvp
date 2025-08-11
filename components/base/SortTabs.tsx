'use client';

import { cn } from '@heroui/react';

import { SortDescendingIcon } from '@/components/icons';

export interface SortTab<T = string> {
  key: T;
  label: string;
}

interface SortTabsProps<T extends string = string> {
  tabs: SortTab<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  showIcon?: boolean;
}

/**
 * Generic sort tabs component based on Figma design tokens
 * Design tokens from components/pages/home/sort.json
 */
function SortTabs<T extends string = string>({
  tabs,
  activeKey,
  onChange,
  showIcon = true,
}: SortTabsProps<T>) {
  return (
    <div className="border-b border-black/10 pb-2">
      <div className="flex items-center gap-[10px]">
        {showIcon && (
          <SortDescendingIcon width={20} height={20} className="text-black" />
        )}
        <div className="flex items-center">
          {tabs.map((tab, index) => {
            const isActive = activeKey === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={cn(
                  'relative px-0 text-[14px] text-black/60 font-[400] transition-all duration-300 ease-in-out',
                  isActive ? '' : 'hover:text-black/80',
                  index > 0 && 'ml-[10px]',
                )}
              >
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-[-10px] h-[2px] bg-black transition-all duration-300 ease-out',
                    isActive
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0',
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SortTabs;
