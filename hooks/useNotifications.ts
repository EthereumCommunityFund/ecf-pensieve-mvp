'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { NotificationItemData } from '@/components/notification/NotificationItem';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

export const useNotifications = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Get all notifications with infinite loading
  const {
    data: allNotificationsData,
    isLoading: isLoadingAll,
    fetchNextPage: fetchNextAllNotifications,
    hasNextPage: hasNextAllNotifications,
    isFetchingNextPage: isFetchingNextAllNotifications,
    refetch: refetchAll,
  } = trpc.notification.getUserNotifications.useInfiniteQuery(
    { limit: 100 },
    {
      enabled: !!isAuthenticated,
      staleTime: 30000,
      refetchInterval: 60000,
      retry: false,
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
    },
  );

  // Get unread notifications only with infinite loading
  const {
    data: unreadNotificationsData,
    isLoading: isLoadingUnread,
    fetchNextPage: fetchNextUnreadNotifications,
    hasNextPage: hasNextUnreadNotifications,
    isFetchingNextPage: isFetchingNextUnreadNotifications,
    refetch: refetchUnread,
  } = trpc.notification.getUserNotifications.useInfiniteQuery(
    { filter: 'unread', limit: 100 },
    {
      enabled: !!isAuthenticated,
      staleTime: 30000,
      refetchInterval: 30000,
      retry: false,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  );

  // Get archived notifications with infinite loading
  const {
    data: archivedNotificationsData,
    isLoading: isLoadingArchived,
    fetchNextPage: fetchNextArchivedNotifications,
    hasNextPage: hasNextArchivedNotifications,
    isFetchingNextPage: isFetchingNextArchivedNotifications,
    refetch: refetchArchived,
  } = trpc.notification.getUserNotifications.useInfiniteQuery(
    { filter: 'archived', limit: 20 },
    {
      enabled: !!isAuthenticated,
      staleTime: 30000,
      retry: false,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  );

  // Mark notifications as read
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: async () => {
      try {
        await Promise.all([refetchAll(), refetchUnread(), refetchArchived()]);
      } catch (error) {
        console.error('Error during refetch:', error);
      }
    },
    onError: (error) => {
      console.error('Error marking notifications as read:', error);
      // 如果出错，重新获取数据以恢复状态
      Promise.all([refetchAll(), refetchUnread(), refetchArchived()]).catch(
        (err) => console.error('Error during error recovery refetch:', err),
      );
    },
  });

  // Archive all notifications
  const archiveAllMutation =
    trpc.notification.archiveAllNotifications.useMutation({
      onSuccess: async () => {
        try {
          await Promise.all([refetchAll(), refetchUnread(), refetchArchived()]);
        } catch (error) {
          console.error('Error during refetch after archive all:', error);
        }
      },
      onError: (error) => {
        console.error('Error archiving all notifications:', error);
        // 如果出错，重新获取数据以恢复状态
        Promise.all([refetchAll(), refetchUnread(), refetchArchived()]).catch(
          (err) => console.error('Error during error recovery refetch:', err),
        );
      },
    });

  // Transform backend notification data to frontend format
  const transformNotification = useCallback(
    (notification: any): NotificationItemData => {
      const getNotificationType = (
        type: string,
      ): NotificationItemData['type'] => {
        switch (type) {
          case 'itemProposalLostLeading':
            return 'itemProposalLostLeading';
          case 'itemProposalBecameLeading':
            return 'itemProposalBecameLeading';
          case 'itemProposalSupported':
            return 'itemProposalSupported';
          case 'proposalPassed':
            return 'proposalPassed';
          case 'projectPublished':
            return 'projectPublished';
          case 'createProposal':
          case 'proposalPass':
          case 'createItemProposal':
          case 'itemProposalPass':
            return 'contributionPoints';
          default:
            return 'default';
        }
      };

      const getTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
          return '0h ago';
        } else if (diffInHours < 24) {
          return `${diffInHours}h ago`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          return `${diffInDays}d ago`;
        }
      };

      const getNotificationContent = (notification: any) => {
        switch (notification.type) {
          case 'itemProposalLostLeading':
            return {
              title: 'Your input has lost sufficient support',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              buttonText: 'View in Project',
            };
          case 'itemProposalBecameLeading':
            return {
              title: 'Your input is now leading',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Submission',
            };
          case 'itemProposalSupported':
            return {
              title: 'Your input has been supported',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              userName:
                notification.voter?.name ||
                notification.voter?.address ||
                'someone',
              buttonText: 'View Submission',
            };
          case 'proposalPassed':
            return {
              title: 'Your proposal has passed!',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Published Project',
              hasMultipleActions: false,
            };
          case 'projectPublished':
            return {
              title: 'Project has been published',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Published Project',
            };
          case 'createProposal':
          case 'proposalPass':
          case 'createItemProposal':
          case 'itemProposalPass':
            return {
              title: 'You have gained contribution points',
              itemName: notification.reward?.toString() || '0',
              buttonText: '',
              hideButton: true,
            };
          default:
            return {
              title: 'You have a new notification',
              buttonText: 'View Details',
            };
        }
      };

      const content = getNotificationContent(notification);

      const isRead = !!notification.readAt;

      return {
        id: notification.id.toString(),
        type: getNotificationType(notification.type),
        timeAgo: getTimeAgo(notification.createdAt),
        isRead,
        ...content,
      };
    },
    [],
  );

  // Transform notifications data
  const allNotifications = useMemo(() => {
    if (!allNotificationsData?.pages) return [];
    return allNotificationsData.pages
      .flatMap((page) => page.notifications)
      .map(transformNotification);
  }, [allNotificationsData, transformNotification]);

  const unreadNotifications = useMemo(() => {
    if (!unreadNotificationsData?.pages) return [];
    return unreadNotificationsData.pages
      .flatMap((page) => page.notifications)
      .map(transformNotification);
  }, [unreadNotificationsData, transformNotification]);

  const archivedNotifications = useMemo(() => {
    if (!archivedNotificationsData?.pages) return [];
    return archivedNotificationsData.pages
      .flatMap((page) => page.notifications)
      .map(transformNotification);
  }, [archivedNotificationsData, transformNotification]);

  // Action handlers
  const handleNotificationAction = useCallback(
    (notification: NotificationItemData, isSecondary = false) => {
      // Search for the notification in all data sources
      let backendNotification = allNotificationsData?.pages
        ?.flatMap((page) => page.notifications)
        .find((n) => n.id.toString() === notification.id);

      if (!backendNotification) {
        backendNotification = unreadNotificationsData?.pages
          ?.flatMap((page) => page.notifications)
          .find((n) => n.id.toString() === notification.id);
      }

      if (!backendNotification) {
        backendNotification = archivedNotificationsData?.pages
          ?.flatMap((page) => page.notifications)
          .find((n) => n.id.toString() === notification.id);
      }

      if (!backendNotification) {
        return;
      }

      // Mark as read if unread
      if (!notification.isRead && !markAsReadMutation.isPending) {
        markAsReadMutation.mutate({
          notificationIds: [parseInt(notification.id)],
        });
      }

      // Navigation logic
      const handleNavigation = () => {
        const projectId = backendNotification?.projectId;

        switch (notification.type) {
          case 'itemProposalLostLeading':
          case 'itemProposalBecameLeading':
          case 'itemProposalSupported':
            // Navigate to project detail page
            if (projectId) {
              router.push(`/project/${projectId}`);
            } else {
              router.push('/projects');
            }
            break;

          case 'proposalPassed':
            // Navigate to project detail or projects list
            if (projectId) {
              router.push(`/project/${projectId}`);
            } else {
              router.push('/projects');
            }
            break;

          case 'projectPublished':
            // Navigate to published project
            if (projectId) {
              router.push(`/project/${projectId}`);
            } else {
              router.push('/projects');
            }
            break;

          case 'contributionPoints':
            // Navigate to projects page for contribution points notifications
            router.push('/projects');
            break;

          case 'systemUpdate':
            // Navigate to home page for system updates
            router.push('/');
            break;

          case 'newItemsAvailable':
            // Navigate to project or projects list
            if (projectId) {
              router.push(`/project/${projectId}`);
            } else {
              router.push('/projects');
            }
            break;

          default:
            // Default navigation to projects list
            router.push('/projects');
            break;
        }
      };

      // Execute navigation
      handleNavigation();

      void isSecondary;
    },
    [
      allNotificationsData,
      unreadNotificationsData,
      archivedNotificationsData,
      markAsReadMutation,
      router,
    ],
  );

  // Handle clicking on the notification itself (marks as read)
  const handleNotificationClick = useCallback(
    (notification: NotificationItemData) => {
      if (!isAuthenticated) {
        return;
      }

      if (markAsReadMutation.isPending) {
        return;
      }

      // Mark as read if unread
      if (!notification.isRead) {
        const notificationId = parseInt(notification.id);

        if (isNaN(notificationId)) {
          return;
        }

        markAsReadMutation.mutate({
          notificationIds: [notificationId],
        });
      }
    },
    [markAsReadMutation, isAuthenticated],
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (markAsReadMutation.isPending) {
      return;
    }

    const unreadIds = unreadNotifications
      .filter((n) => !n.isRead)
      .map((n) => parseInt(n.id));

    if (unreadIds.length > 0) {
      markAsReadMutation.mutate({ notificationIds: unreadIds });
    }
  }, [unreadNotifications, markAsReadMutation]);

  const handleArchiveAll = useCallback(() => {
    if (archiveAllMutation.isPending) {
      return;
    }

    archiveAllMutation.mutate();
  }, [archiveAllMutation]);

  const handleSettings = useCallback(() => {
    router.push('/settings/notifications');
  }, [router]);

  return {
    // Data
    allNotifications,
    unreadNotifications,
    archivedNotifications,
    unreadCount: unreadNotifications.length,
    totalCount: allNotifications.length,

    // Raw data for debugging
    allNotificationsData,
    unreadNotificationsData,
    archivedNotificationsData,

    // Loading states
    isLoading: isAuthenticated
      ? isLoadingAll || isLoadingUnread || isLoadingArchived
      : false,

    // Mutation loading states
    isMarkingAsRead: markAsReadMutation.isPending,
    isArchivingAll: archiveAllMutation.isPending,

    // Pagination states
    hasNextAllNotifications,
    hasNextUnreadNotifications,
    hasNextArchivedNotifications,
    isFetchingNextAllNotifications,
    isFetchingNextUnreadNotifications,
    isFetchingNextArchivedNotifications,

    // Pagination actions
    fetchNextAllNotifications,
    fetchNextUnreadNotifications,
    fetchNextArchivedNotifications,

    // Actions
    handleNotificationAction,
    handleNotificationClick,
    handleMarkAllAsRead,
    handleArchiveAll,
    handleSettings,

    // Auth state
    isAuthenticated,

    // Refetch
    refetch: () => {
      if (isAuthenticated) {
        refetchAll();
        refetchUnread();
        refetchArchived();
      }
    },
  };
};
