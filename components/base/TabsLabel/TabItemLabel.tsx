'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { TabItemLabelProps } from './types';

const TabItemLabel: FC<TabItemLabelProps> = ({
  tab,
  isActive,
  onClick,
  isLast,
  className,
}) => {
  return (
    <button
      className={cn(
        'relative px-4 py-3 text-base font-medium transition-colors border-b-2',
        'hover:text-black',
        isActive
          ? 'text-black border-black'
          : 'text-[#666666] border-transparent',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span>{tab.label}</span>
        {tab.count !== undefined && (
          <span className="text-[#999999]">{tab.count}</span>
        )}
      </div>
    </button>
  );
};

export default TabItemLabel;
