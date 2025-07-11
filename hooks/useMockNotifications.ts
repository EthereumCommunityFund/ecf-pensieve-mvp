'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { mockNotifications } from '@/components/notification/mock/notifications';
import { NotificationItemData } from '@/components/notification/NotificationItem';

export const useMockNotifications = () => {
  const router = useRouter();

  const unreadNotifications = useMemo(
    () => mockNotifications.filter((n) => !n.isRead),
    [],
  );
  const allNotifications = useMemo(() => mockNotifications, []);

  return {
    // Data
    allNotifications,
    unreadNotifications,
    archivedNotifications: [],
    unreadCount: unreadNotifications.length,
    totalCount: allNotifications.length,

    // Raw data for debugging
    allNotificationsData: undefined,
    unreadNotificationsData: undefined,
    archivedNotificationsData: undefined,

    // Loading states
    isLoading: false,

    // Mutation loading states
    isMarkingAsRead: false,
    isArchivingAll: false,

    // Pagination states
    hasNextAllNotifications: false,
    hasNextUnreadNotifications: false,
    hasNextArchivedNotifications: false,
    isFetchingNextAllNotifications: false,
    isFetchingNextUnreadNotifications: false,
    isFetchingNextArchivedNotifications: false,

    // Pagination actions
    fetchNextAllNotifications: () => {
      console.log('Mock Fetch Next All Notifications');
    },
    fetchNextUnreadNotifications: () => {
      console.log('Mock Fetch Next Unread Notifications');
    },
    fetchNextArchivedNotifications: () => {
      console.log('Mock Fetch Next Archived Notifications');
    },

    // Actions
    handleNotificationAction: (notification: NotificationItemData) => {
      console.log('Mock Notification Action:', notification);
    },
    handleNotificationClick: (notification: NotificationItemData) => {
      console.log('Mock Notification Click:', notification);
    },
    handleMarkAllAsRead: () => {
      console.log('Mock Mark All As Read');
    },
    handleArchiveAll: () => {
      console.log('Mock Archive All');
    },
    handleSettings: () => {
      router.push('/settings/notifications');
    },

    // Auth state
    isAuthenticated: true,

    // Refetch
    refetch: () => {
      console.log('Mock Refetch');
    },
  };
};
