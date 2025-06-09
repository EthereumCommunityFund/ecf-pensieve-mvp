'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import TabItem from './TabItem';
import { TabProps } from './types';

const Tab: FC<TabProps> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div
      className={cn(
        'flex rounded-[10px] bg-[#F0F0F0] border border-[rgba(0,0,0,0.1)] p-[5px]',
        className,
      )}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        />
      ))}
    </div>
  );
};

export default Tab;
export { default as TabSkeleton } from './TabSkeleton';
export type { TabItem as TabItemType, TabProps } from './types';
export { TabItem };
