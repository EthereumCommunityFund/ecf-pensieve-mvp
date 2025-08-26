'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

interface Tab {
  key: string;
  label: string;
}

interface ProjectTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
}

const ProjectTabs: FC<ProjectTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-[20px]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'pb-[12px] text-[16px] font-[600] leading-[22px] transition-all',
            activeTab === tab.key
              ? 'border-b-[2px] border-black text-black'
              : 'border-b-[2px] border-transparent text-black/60 hover:text-black',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
