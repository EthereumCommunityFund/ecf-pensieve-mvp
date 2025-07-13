'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import {
  FrontendNotificationType,
  IVoterOfNotification,
  NotificationItemData,
} from '@/components/notification/NotificationItem';
import { useAuth } from '@/context/AuthContext';
import { NotificationType } from '@/lib/services/notification';
import { trpc } from '@/lib/trpc/client';
import { devLog } from '@/utils/devLog';

const useRealNotifications = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

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
      select: (data) => {
        devLog('[Backend] all Notifications Data', data);
        return data;
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
      select: (data) => {
        devLog('[Backend]unread Notifications Data', data);
        return data;
      },
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

      const getTransformedContent = (notification: any) => {
        const type = notification.type as NotificationType;
        switch (type) {
          case 'itemProposalLostLeading':
            return {
              type,
              title: 'Your input has lost sufficient support',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Submission',
            };
          case 'itemProposalBecameLeading':
            return {
              type,
              title: 'Your input is now leading',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Submission',
            };
          case 'itemProposalSupported':
            return {
              type,
              title: 'Your input has been supported',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              userName:
                notification.voter?.name ||
                notification.voter?.address ||
                'someone',
              buttonText: 'View Submission',
            };
          // For item votes on pending projects
          // TODO: Currently there's a notification for each vote, resulting in too many notifications for pending projects. This feature needs optimization
          case 'proposalSupported':
            return {
              type,
              title: 'Your proposal has been supported',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              userName:
                notification.voter?.name ||
                notification.voter?.address ||
                'someone',
              buttonText: 'View Proposal',
            };
          // For item votes on published projects
          case 'itemProposalPassed':
            return {
              type,
              title: 'Your item proposal has passed',
              itemName: notification.itemProposal?.key || 'item',
              projectName: notification.project?.name || 'project',
              userName:
                notification.voter?.name ||
                notification.voter?.address ||
                'someone',
              buttonText: 'View Submission',
            };
          // Project proposal published successfully, but without reward points, showing "View Published Project" entry
          case 'proposalPassed':
            return {
              type,
              title: 'Your proposal has passed!',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Published Project',
              hasMultipleActions: false,
            };
          // Project published successfully, same as proposalPassed type, showing "View Published Project" entry, but with different text
          case 'projectPublished':
            return {
              type,
              title: 'Project has been published',
              projectName: notification.project?.name || 'project',
              buttonText: 'View Published Project',
            };
          // Create project -> contributionPoints
          // TODO: UI can add createProposal type, redirecting to project/pending/[projectId]/proposal/[proposal] page
          case 'createProposal':
          // Project published successfully, with reward points, showing `contributionPoints` type
          case 'proposalPass':
          // Only create not essential item will be notified -> contributionPoints
          // TODO: UI can add createItemProposal type
          case 'createItemProposal':
          case 'itemProposalPass':
            return {
              type: 'contributionPoints' as FrontendNotificationType,
              title: 'You have gained contribution points',
              itemName: notification.reward?.toString() || '0',
              buttonText: '',
              hideButton: true,
            };
          default:
            return {
              type: 'default' as FrontendNotificationType,
              title: 'You have a new notification',
              buttonText: 'View Details',
            };
        }
      };

      const content = getTransformedContent(notification);
      const isRead = !!notification.readAt;

      return {
        id: notification.id.toString(),
        timeAgo: getTimeAgo(notification.createdAt),
        isRead,
        voter: notification.voter as IVoterOfNotification,
        ...content,
      } as NotificationItemData;
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

  useEffect(() => {
    if (allNotifications.length > 0) {
      devLog('[Frontend] transformed all Notifications', allNotifications);
    }
    if (unreadNotifications.length > 0) {
      devLog(
        '[Frontend] transformed unread Notifications',
        unreadNotifications,
      );
    }
  }, [allNotifications, unreadNotifications]);

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
        const proposalId = backendNotification?.proposalId;

        switch (notification.type) {
          case 'itemProposalLostLeading':
          case 'itemProposalBecameLeading':
          case 'itemProposalSupported':
          case 'itemProposalPassed':
            if (projectId) {
              router.push(
                `/project/${projectId}?tab=project-data&notificationType=viewSubmission&itemName=${notification.itemName}`,
              );
            } else {
              router.push('/projects');
            }
            break;

          case 'proposalSupported':
            router.push(`/project/pending/${projectId}/proposal/${proposalId}`);
            break;

          case 'proposalPassed':
          case 'proposalPass':
          case 'projectPublished':
            router.push(projectId ? `/project/${projectId}` : '/projects');
            break;
          case 'createProposal':
          case 'createItemProposal':
          // 缺乏对于的 UI和 Button
          case 'contributionPoints':
            router.push('/projects');
            break;

          case 'systemUpdate':
          case 'newItemsAvailable':
          case 'default':
            router.push('/');
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

  const handleArchiveAll = useCallback(async () => {
    if (archiveAllMutation.isPending || markAsReadMutation.isPending) {
      return;
    }

    try {
      const unreadIds = allNotifications
        .filter((n) => !n.isRead)
        .map((n) => parseInt(n.id));

      if (unreadIds.length > 0) {
        await markAsReadMutation.mutateAsync({ notificationIds: unreadIds });
      }

      await archiveAllMutation.mutateAsync();

      await utils.notification.getUserNotifications.invalidate();
      await Promise.all([refetchAll(), refetchUnread(), refetchArchived()]);
    } catch (error) {
      console.error('Error during archive all operation:', error);
    }
  }, [
    archiveAllMutation,
    markAsReadMutation,
    allNotifications,
    utils,
    refetchAll,
    refetchUnread,
    refetchArchived,
  ]);

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

export const useNotifications = () => {
  // return useMockNotifications();
  return useRealNotifications();
};
