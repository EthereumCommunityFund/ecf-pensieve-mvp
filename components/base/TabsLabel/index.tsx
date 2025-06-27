'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import TabItemLabel from './TabItemLabel';
import { TabsLabelProps } from './types';

const TabsLabel: FC<TabsLabelProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('border-b border-[#E5E5E5]', className)}>
      <div className="flex justify-between">
        <div className="flex">
          {tabs
            .filter((tab) => tab.key === 'submission-queue')
            .map((tab) => (
              <TabItemLabel
                key={tab.key}
                tab={tab}
                isActive={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
              />
            ))}
        </div>
        <div className="flex">
          {tabs
            .filter((tab) => tab.key !== 'submission-queue')
            .map((tab) => (
              <TabItemLabel
                key={tab.key}
                tab={tab}
                isActive={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default TabsLabel;
export type { TabItemLabel as TabItemLabelType, TabsLabelProps } from './types';
export { TabItemLabel };
