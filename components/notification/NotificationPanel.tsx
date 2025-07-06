'use client';

import React, { useState } from 'react';

import { useNotifications } from '@/hooks/useNotifications';

import { NotificationActions } from './NotificationActions';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItem } from './NotificationItem';
import { NotificationFilter, NotificationTabs } from './NotificationTabs';

export interface NotificationPanelProps {
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
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
    <div
      className={`relative h-[520px] w-[380px] overflow-hidden rounded-[10px] border border-black/10 bg-white ${className}`}
    >
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
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Notifications List */}
      <div className="scrollbar-hide h-[376px] flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-black/50">
            Loading notifications...
          </div>
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
  );
};
