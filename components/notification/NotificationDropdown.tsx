'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from '@heroui/react';
import React, { useCallback, useEffect, useState } from 'react';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useNotifications } from '@/hooks/useNotifications';

import { NotificationIcon } from '../icons';

import { NotificationActions } from './NotificationActions';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItem } from './NotificationItem';
import {
  NotificationItemSkeleton,
  NotificationListSkeleton,
} from './NotificationItemSkeleton';
import { NotificationFilter, NotificationTabs } from './NotificationTabs';

export interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  // Control dropdown open/close state
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const {
    allNotifications,
    unreadNotifications,
    archivedNotifications,
    unreadCount,
    totalCount,
    isLoading,
    hasNextAllNotifications,
    hasNextUnreadNotifications,
    hasNextArchivedNotifications,
    isFetchingNextAllNotifications,
    isFetchingNextUnreadNotifications,
    isFetchingNextArchivedNotifications,
    fetchNextAllNotifications,
    fetchNextUnreadNotifications,
    fetchNextArchivedNotifications,
    handleNotificationAction,
    handleNotificationClick,
    handleMarkAllAsRead,
    handleArchiveAll,
    handleSettings,
  } = useNotifications();

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return unreadNotifications;
      case 'archived':
        return archivedNotifications;
      case 'all':
      default:
        return allNotifications;
    }
  };

  const getHasNextPage = () => {
    switch (activeFilter) {
      case 'unread':
        return hasNextUnreadNotifications;
      case 'archived':
        return hasNextArchivedNotifications;
      case 'all':
      default:
        return hasNextAllNotifications;
    }
  };

  const getIsFetchingNextPage = () => {
    switch (activeFilter) {
      case 'unread':
        return isFetchingNextUnreadNotifications;
      case 'archived':
        return isFetchingNextArchivedNotifications;
      case 'all':
      default:
        return isFetchingNextAllNotifications;
    }
  };

  const fetchNextPage = useCallback(() => {
    switch (activeFilter) {
      case 'unread':
        fetchNextUnreadNotifications();
        break;
      case 'archived':
        fetchNextArchivedNotifications();
        break;
      case 'all':
      default:
        fetchNextAllNotifications();
        break;
    }
  }, [
    activeFilter,
    fetchNextUnreadNotifications,
    fetchNextArchivedNotifications,
    fetchNextAllNotifications,
  ]);

  const filteredNotifications = getFilteredNotifications();
  const hasNextPage = getHasNextPage();
  const isFetchingNextPage = getIsFetchingNextPage();

  // Wrapper functions to close dropdown after actions
  const handleNotificationActionWithClose = useCallback(
    (itemData: any, isSecondary = false) => {
      handleNotificationAction(itemData, isSecondary);
      onClose(); // Close dropdown after action
    },
    [handleNotificationAction, onClose],
  );

  const onClickNotification = useCallback(
    (itemData: any) => {
      handleNotificationClick(itemData);
      // onClose(); // Close dropdown after click
    },
    [handleNotificationClick],
  );

  const onMarkAllAsRead = useCallback(() => {
    handleMarkAllAsRead();
  }, [handleMarkAllAsRead]);

  const onArchiveAll = useCallback(() => {
    handleArchiveAll();
  }, [handleArchiveAll]);

  const handleSettingsWithClose = useCallback(() => {
    handleSettings();
    onClose(); // Close dropdown after opening settings
  }, [handleSettings, onClose]);

  // Intersection Observer for infinite scrolling
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    enabled: hasNextPage && !isFetchingNextPage,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    activeFilter,
  ]);

  return (
    <Dropdown
      placement="bottom-end"
      className={className}
      classNames={{
        content: 'p-0 border-0 bg-white rounded-[10px] shadow-lg',
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
        closeOnSelect={false}
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
                onMarkAllAsRead={onMarkAllAsRead}
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
            <div className="scrollbar-hide h-[376px] flex-1 overflow-y-auto pb-[10px]">
              {isLoading ? (
                <NotificationListSkeleton count={3} />
              ) : filteredNotifications.length > 0 ? (
                <>
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      itemData={notification}
                      onButtonClick={handleNotificationActionWithClose}
                      onSecondaryButtonClick={(itemData) =>
                        handleNotificationActionWithClose(itemData, true)
                      }
                      onNotificationClick={onClickNotification}
                    />
                  ))}

                  {/* Load More Trigger */}
                  {hasNextPage && (
                    <div ref={targetRef} className="flex min-h-[110px] w-full">
                      {isFetchingNextPage ? (
                        <div className="flex flex-col space-y-2">
                          <NotificationItemSkeleton />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500"></div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-black/50">
                  No notifications
                </div>
              )}
            </div>

            {/* Actions */}
            <NotificationActions
              onSettings={handleSettingsWithClose}
              onArchiveAll={onArchiveAll}
            />
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
