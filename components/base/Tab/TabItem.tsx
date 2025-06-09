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
        isActive
          ? 'bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] hover:bg-white opacity-100'
          : 'bg-transparent rounded-[5px] opacity-80 hover:bg-transparent',
        className,
      )}
      onPress={onClick}
    >
      <div className="flex items-center gap-2.5">
        <span className="font-open-sans text-[14px] font-semibold leading-[1.36] text-black">
          {tab.label}
        </span>
        {tab.count && (
          <span className="font-open-sans text-[14px] font-semibold leading-[1.36] text-black opacity-30">
            {tab.count}
          </span>
        )}
      </div>
    </Button>
  );
};

export default TabItem;
