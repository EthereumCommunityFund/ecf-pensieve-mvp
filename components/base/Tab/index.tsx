'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import TabItem from './TabItem';
import { TabProps } from './types';

const Tab: FC<TabProps> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div className={cn('flex rounded-[10px] bg-[#EBEBEB] p-[5px]', className)}>
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
export type { TabItem as TabItemType, TabProps } from './types';
export { TabItem };
