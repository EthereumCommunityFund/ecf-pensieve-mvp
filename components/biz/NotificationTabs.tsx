'use client';

import React from 'react';

import { Button } from '../base/button';

export type NotificationFilter = 'all' | 'unread' | 'archived';

export interface NotificationTabsProps {
  activeFilter: NotificationFilter;
  allCount: number;
  unreadCount: number;
  onFilterChange: (filter: NotificationFilter) => void;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeFilter,
  allCount,
  unreadCount,
  onFilterChange,
}) => {
  const getButtonVariant = (filter: NotificationFilter) => {
    return activeFilter === filter ? 'primary' : 'secondary';
  };

  const getButtonStyles = (filter: NotificationFilter) => {
    if (activeFilter === filter) {
      return 'bg-transparent border-0 border-b-3 border-black/60 rounded-none text-black';
    }
    return 'bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.15)] text-black rounded-[5px]';
  };

  return (
    <div className="flex w-full items-center border-b border-black/10 bg-[#F0F0F0] p-0 px-[14px]">
      <div className="flex items-center">
        <Button
          size="md"
          onPress={() => onFilterChange('all')}
          className={getButtonStyles('all')}
        >
          <span className="text-[14px] font-semibold leading-[19px] text-black">
            All
          </span>
          <span className="text-[14px] font-semibold leading-[19px] text-black opacity-30">
            {allCount}
          </span>
        </Button>

        <Button
          size="md"
          onPress={() => onFilterChange('unread')}
          className={getButtonStyles('unread')}
        >
          <span className="text-[14px] font-semibold leading-[19px] text-black">
            Unread
          </span>
          <span className="text-[14px] font-semibold leading-[19px] text-black opacity-30">
            {unreadCount}
          </span>
        </Button>

        <Button
          size="md"
          onPress={() => onFilterChange('archived')}
          className={getButtonStyles('archived')}
        >
          <span className="text-[14px] font-semibold leading-[19px] text-black">
            Archived
          </span>
        </Button>
      </div>
    </div>
  );
};
