'use client';

import { cn } from '@heroui/react';
import { motion } from 'framer-motion';
import { FC, ReactNode } from 'react';

interface Tab {
  key: string;
  label: ReactNode;
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
    <div className={cn('inline-flex gap-[20px]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'relative pb-[12px] text-[16px] font-[600] leading-[22px] transition-colors duration-300 text-black',
            activeTab === tab.key
              ? 'opacity-100'
              : 'opacity-40 hover:opacity-80',
          )}
        >
          {tab.label}
          {activeTab === tab.key && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute inset-x-0 -bottom-px h-[2px] bg-black"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
