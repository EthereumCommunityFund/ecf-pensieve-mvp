'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { NotificationItemProps } from '@/components/notification/NotificationItem';
import { mockNotifications } from '@/components/notification/mock/notifications';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

const useMockData = process.env.NEXT_PUBLIC_MOCK_NOTIFICATIONS === 'true';

export const useNotifications = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Get all notifications
  const {
    data: allNotificationsData,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = trpc.notification.getUserNotifications.useQuery(
    { limit: 50 },
    {
      enabled: !!isAuthenticated && !useMockData,
      staleTime: 30000,
      refetchInterval: 60000,
      retry: false,
    },
  );

  // Get unread notifications only
  const {
    data: unreadNotificationsData,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = trpc.notification.getUserNotifications.useQuery(
    { filter: 'unread', limit: 50 },
    {
      enabled: !!isAuthenticated && !useMockData,
      staleTime: 30000,
      refetchInterval: 30000,
      retry: false,
    },
  );

  // Mark notifications as read
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetchAll();
      refetchUnread();
    },
  });

  // Archive all notifications
  const archiveAllMutation =
    trpc.notification.archiveAllNotifications.useMutation({
      onSuccess: () => {
        refetchAll();
        refetchUnread();
      },
    });

  // Transform backend notification data to frontend format
  const transformNotification = useCallback(
    (notification: any): NotificationItemProps => {
      const getNotificationType = (
        type: string,
      ): NotificationItemProps['type'] => {
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
              buttonText: '', // 隐藏按钮
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

      return {
        id: notification.id.toString(),
        type: getNotificationType(notification.type),
        timeAgo: getTimeAgo(notification.createdAt),
        isRead: !!notification.readAt,
        ...content,
      };
    },
    [],
  );

  // Transform notifications data
  const allNotifications = useMemo(() => {
    if (useMockData) return mockNotifications;
    if (!allNotificationsData?.notifications) return [];
    return allNotificationsData.notifications.map(transformNotification);
  }, [allNotificationsData, transformNotification]);

  const unreadNotifications = useMemo(() => {
    if (useMockData) return mockNotifications.filter((n) => !n.isRead);
    if (!unreadNotificationsData?.notifications) return [];
    return unreadNotificationsData.notifications.map(transformNotification);
  }, [unreadNotificationsData, transformNotification]);

  // Action handlers
  const handleNotificationAction = useCallback(
    (notification: NotificationItemProps, isSecondary = false) => {
      if (useMockData) {
        console.log('Mock notification action:', notification);
        return;
      }

      const backendNotification = allNotificationsData?.notifications.find(
        (n) => n.id.toString() === notification.id,
      );

      if (!backendNotification) return;

      // Mark as read if unread
      if (!notification.isRead) {
        markAsReadMutation.mutate({
          notificationIds: [parseInt(notification.id)],
        });
      }

      // Navigate based on notification type and action
      switch (notification.type) {
        case 'itemProposalLostLeading':
          if (backendNotification.projectId) {
            router.push(`/project/${backendNotification.projectId}`);
          }
          break;
        case 'itemProposalBecameLeading':
        case 'itemProposalSupported':
          if (backendNotification.projectId) {
            router.push(
              `/project/${backendNotification.projectId}/submissions`,
            );
          }
          break;
        case 'proposalPassed':
        case 'projectPublished':
          if (backendNotification.projectId) {
            router.push(`/project/${backendNotification.projectId}`);
          }
          break;
        case 'contributionPoints':
          break;
        default:
          if (backendNotification.projectId) {
            router.push(`/project/${backendNotification.projectId}`);
          }
          break;
      }

      // 阻止 TypeScript 警告
      void isSecondary;
    },
    [allNotificationsData, markAsReadMutation, router],
  );

  // Handle clicking on the notification itself (marks as read)
  const handleNotificationClick = useCallback(
    (notification: NotificationItemProps) => {
      if (useMockData) {
        console.log('Mock notification click:', notification);
        return;
      }

      // Mark as read if unread
      if (!notification.isRead) {
        markAsReadMutation.mutate({
          notificationIds: [parseInt(notification.id)],
        });
      }
    },
    [markAsReadMutation],
  );

  const handleMarkAllAsRead = useCallback(() => {
    const unreadIds = unreadNotifications
      .filter((n) => !n.isRead)
      .map((n) => parseInt(n.id));

    if (unreadIds.length > 0) {
      markAsReadMutation.mutate({ notificationIds: unreadIds });
    }
  }, [unreadNotifications, markAsReadMutation]);

  const handleArchiveAll = useCallback(() => {
    archiveAllMutation.mutate();
  }, [archiveAllMutation]);

  const handleSettings = useCallback(() => {
    router.push('/settings/notifications');
  }, [router]);

  return {
    // Data
    allNotifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    totalCount: allNotifications.length,

    // Loading states
    isLoading: isAuthenticated ? isLoadingAll || isLoadingUnread : false,

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
      }
    },
  };
};
