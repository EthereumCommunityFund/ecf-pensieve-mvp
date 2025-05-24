'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base/button';

import { TabItemProps } from './types';

const TabItem: FC<TabItemProps> = ({ tab, isActive, onClick, className }) => {
  return (
    <Button
      className={cn(
        'flex-1 px-5 py-2.5 border-none',
        'hover:bg-[#EBEBEB]',
        isActive
          ? 'bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] hover:bg-white'
          : '',
        className,
      )}
      onPress={onClick}
    >
      <div className="flex items-center gap-2.5">
        <span className="font-sans text-[14px] font-semibold text-black">
          {tab.label}
        </span>
        {tab.count && (
          <span className="font-sans text-[14px] font-semibold text-black opacity-30">
            {tab.count}
          </span>
        )}
      </div>
    </Button>
  );
};

export default TabItem;
