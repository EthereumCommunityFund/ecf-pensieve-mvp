'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import React, { useState } from 'react';

import { useNotifications } from '@/hooks/useNotifications';

import { NotificationIcon } from '../icons';

import { NotificationActions } from './NotificationActions';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItem } from './NotificationItem';
import { NotificationListSkeleton } from './NotificationItemSkeleton';
import { NotificationFilter, NotificationTabs } from './NotificationTabs';

export interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = '',
}) => {
  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>('unread');

  const {
    allNotifications,
    unreadNotifications,
    unreadCount,
    totalCount,
    isLoading,
    handleNotificationAction,
    handleMarkAllAsRead,
    handleArchiveAll,
    handleSettings,
  } = useNotifications();

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return unreadNotifications;
      case 'archived':
        return []; // TODO: Add archived filter logic
      case 'all':
      default:
        return allNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Dropdown
      placement="bottom-end"
      className={className}
      classNames={{
        content: 'p-0 border-0 bg-white rounded-[10px] shadow-lg',
      }}
    >
      <DropdownTrigger>
        <div className="cursor-pointer">
          <NotificationIcon isActive={unreadCount > 0} />
        </div>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifications"
        className="w-[380px] p-0"
        itemClasses={{
          base: 'p-0 m-0 gap-0 rounded-[10px]',
        }}
      >
        <DropdownItem
          key="notifications"
          className="rounded-[10px] p-0"
          textValue="notifications"
        >
          <div className="relative h-[520px] w-[380px] overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Header */}
            <div className="relative z-10 bg-[rgba(255,255,255,0.9)] backdrop-blur-[10px]">
              <NotificationHeader
                totalCount={totalCount}
                onMarkAllAsRead={handleMarkAllAsRead}
              />

              {/* Tabs */}
              <NotificationTabs
                activeFilter={activeFilter}
                allCount={totalCount}
                unreadCount={unreadCount}
                onFilterChange={(filter) => {
                  setActiveFilter(filter);
                }}
              />
            </div>

            {/* Notifications List */}
            <div className="scrollbar-hide h-[376px] flex-1 overflow-y-auto">
              {isLoading ? (
                <NotificationListSkeleton count={3} />
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    {...notification}
                    onButtonClick={() => handleNotificationAction(notification)}
                    onSecondaryButtonClick={() =>
                      handleNotificationAction(notification, true)
                    }
                  />
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-black/50">
                  No notifications
                </div>
              )}
            </div>

            {/* Actions */}
            <NotificationActions
              onSettings={handleSettings}
              onArchiveAll={handleArchiveAll}
            />
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
