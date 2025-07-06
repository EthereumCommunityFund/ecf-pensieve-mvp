'use client';

import React from 'react';

import NotificationTabs, {
  NotificationTabItemType,
} from '../base/NotificationTabs';

export type NotificationFilter = 'all' | 'unread' | 'archived';

export interface NotificationTabsProps {
  activeFilter: NotificationFilter;
  allCount: number;
  unreadCount: number;
  onFilterChange: (filter: NotificationFilter) => void;
}

export const NotificationTabsWrapper: React.FC<NotificationTabsProps> = ({
  activeFilter,
  allCount,
  unreadCount,
  onFilterChange,
}) => {
  const tabs: NotificationTabItemType[] = [
    {
      key: 'all',
      label: 'All',
      count: allCount,
    },
    {
      key: 'unread',
      label: 'Unread',
      count: unreadCount,
    },
    {
      key: 'archived',
      label: 'Archived',
    },
  ];

  const handleTabChange = (tabKey: string) => {
    onFilterChange(tabKey as NotificationFilter);
  };

  return (
    <NotificationTabs
      tabs={tabs}
      activeTab={activeFilter}
      onTabChange={handleTabChange}
    />
  );
};

// 保持向后兼容性
export { NotificationTabsWrapper as NotificationTabs };
