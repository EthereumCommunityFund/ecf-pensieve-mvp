'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import NotificationTabItem from './NotificationTabItem';
import { NotificationTabsProps } from './types';

const NotificationTabs: FC<NotificationTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const handleTabChange = (tabKey: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onTabChange(tabKey);
  };

  return (
    <div
      className={cn(
        'flex w-full items-center border-b border-black/10 p-0 px-[14px]',
        className,
      )}
    >
      <div className="flex items-center">
        {tabs.map((tab) => (
          <NotificationTabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onClick={handleTabChange(tab.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationTabs;
export type {
  NotificationTabItem as NotificationTabItemType,
  NotificationTabsProps,
} from './types';
export { NotificationTabItem };
