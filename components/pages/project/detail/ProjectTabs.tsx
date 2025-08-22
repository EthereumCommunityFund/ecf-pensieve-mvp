'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

interface ProjectTab {
  key: string;
  label: string;
}

interface ProjectTabsProps {
  tabs: ProjectTab[];
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
        'flex items-center gap-[24px] border-b border-black/10',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'relative flex h-[40px] items-center font-open-sans text-[15px] transition-all',
            activeTab === tab.key
              ? 'text-black font-[600]'
              : 'text-black/60 font-[400] hover:text-black/80',
          )}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-black/80" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
