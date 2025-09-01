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
    <div
      className={cn(
        'inline-flex gap-[20px] border-b border-black/10',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'relative pb-[12px] text-[16px] font-[600] leading-[22px] transition-all',
            activeTab === tab.key
              ? 'text-black after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-black'
              : 'text-black/60 hover:text-black',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
