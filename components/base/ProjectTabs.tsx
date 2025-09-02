'use client';

import { cn } from '@heroui/react';
import { motion } from 'framer-motion';
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
            'relative pb-[12px] text-[16px] font-[600] leading-[22px] transition-colors duration-300',
            activeTab === tab.key
              ? 'text-black'
              : 'text-black/60 hover:text-black',
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
