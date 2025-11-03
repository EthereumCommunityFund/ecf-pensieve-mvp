'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import {
  FrontendNotificationType,
  IVoterOfNotification,
  NotificationItemData,
} from '@/components/notification/NotificationItem';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { parseHarbergerTaxNotificationExtra } from '@/lib/notifications/harbergerTax';
import {
  parseNotificationMetadata,
  resolveMetadataBody,
  resolveMetadataCta,
  resolveMetadataNavigationUrl,
  resolveMetadataTitle,
} from '@/lib/notifications/metadata';
import { NotificationType } from '@/lib/services/notification';
import { getItemValueFromSnap } from '@/lib/services/share/shareUtils';
import { trpc } from '@/lib/trpc/client';
import { formatTimeAgo } from '@/lib/utils';

const MOCK_NOTIFICATIONS_ENABLED =
  process.env.NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS === 'true';

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
      refetchInterval: 1000 * 60 * 5,
      retry: false,
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      select: (data) => {
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
      refetchInterval: 1000 * 60 * 5,
      retry: false,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
      select: (data) => {
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
    (notification: any): NotificationItemData | null => {
      const projectName = (() => {
        const snapItems = notification.projectSnaps?.items;
        const proposalItems = notification.proposal?.items;
        if (Array.isArray(snapItems)) {
          const name = getItemValueFromSnap(snapItems, 'name');
          if (name) {
            return name;
          }
        }

        if (typeof notification.project?.name === 'string') {
          return notification.project.name;
        }

        if (Array.isArray(proposalItems)) {
          const name = getItemValueFromSnap(proposalItems, 'name');
          if (name) {
            return name;
          }
        }

        return 'project';
      })();

      const resolveItemLabel = (key?: string | null): string => {
        if (!key) {
          return 'item';
        }

        const config = AllItemConfig[key as keyof typeof AllItemConfig];
        return config?.label ?? key;
      };

      const normalizeProfile = (
        profile: any,
      ): IVoterOfNotification | undefined => {
        if (!profile) {
          return undefined;
        }

        return {
          name: profile.name || profile.address || 'someone',
          address: profile.address || '',
          avatarUrl: profile.avatarUrl,
          userId: profile.userId,
        };
      };

      const rawCreatorProfile =
        notification.itemProposal?.creator || notification.proposal?.creator;

      const creatorProfile = normalizeProfile(rawCreatorProfile);
      const voterProfile = normalizeProfile(notification.voter);

      const ownerProfile = creatorProfile;
      const ownerDisplayName = ownerProfile?.name || 'someone';
      const ownerIsSelf = ownerProfile?.userId === notification.userId;

      const actorRole: 'creator' | 'voter' | null = (() => {
        const type = notification.type as NotificationType;
        switch (type) {
          case 'proposalSupported':
          case 'itemProposalSupported':
            return 'voter';
          case 'itemProposalBecameLeading':
          case 'itemProposalLostLeading':
          case 'itemProposalPassed':
          case 'itemProposalPass':
          case 'createItemProposal':
          case 'createProposal':
          case 'proposalPassed':
          case 'proposalPass':
            return 'creator';
          default:
            return null;
        }
      })();

      const actorProfile =
        actorRole === 'creator'
          ? ownerProfile
          : actorRole === 'voter'
            ? voterProfile
            : undefined;

      const actorIsSelf =
        actorProfile?.userId !== undefined &&
        actorProfile.userId === notification.userId;

      const getTransformedContent = (notification: any) => {
        const type = notification.type as NotificationType;
        switch (type) {
          case 'harbergerSlotExpiring': {
            const parsedMetadata = parseNotificationMetadata(
              notification.metadata ?? null,
            );
            const harbergerMetadata = parseHarbergerTaxNotificationExtra(
              parsedMetadata.extra as Record<string, unknown> | undefined,
            );

            if (!harbergerMetadata) {
              return {
                type: 'default' as FrontendNotificationType,
                title: 'Harberger slot tax update',
                buttonText: 'View Details',
                hideButton: true,
              };
            }

            const slotUrl = `/ads/slots/${harbergerMetadata.slotAddress.toLowerCase()}`;
            const payUrl = `${slotUrl}?action=pay`;

            return {
              type,
              title: 'Harberger slot tax notification',
              buttonText: '',
              hideButton: true,
              hasMultipleActions: true,
              metadata: parsedMetadata.raw,
              metadataTitle: parsedMetadata.title,
              metadataBody: parsedMetadata.body,
              metadataExtra: parsedMetadata.extra ?? undefined,
              harbergerTax: harbergerMetadata,
              ctaLabel: 'Pay Now',
              ctaUrl: payUrl,
              targetUrl: slotUrl,
              primaryActionUrl: payUrl,
              secondaryActionUrl: slotUrl,
            } satisfies NotificationItemData;
          }
          case 'itemProposalLostLeading':
            return {
              type,
              title: 'Your input has lost sufficient support',
              itemKey: notification.itemProposal?.key ?? '',
              itemName: resolveItemLabel(notification.itemProposal?.key),
              projectName,
              buttonText: 'View Submission',
              actor: actorProfile,
              actorIsSelf,
            };
          case 'itemProposalBecameLeading':
            return {
              type,
              title: 'Your input is now leading',
              itemKey: notification.itemProposal?.key ?? '',
              itemName: resolveItemLabel(notification.itemProposal?.key),
              projectName,
              buttonText: 'View Submission',
              actor: actorProfile,
              actorIsSelf,
            };
          case 'itemProposalSupported':
            return {
              type,
              title: 'Your input has been supported',
              itemKey: notification.itemProposal?.key ?? '',
              itemName: resolveItemLabel(notification.itemProposal?.key),
              projectName,
              userName: voterProfile?.name || 'someone',
              buttonText: 'View Submission',
              actor: actorProfile,
              actorIsSelf,
            };
          // For item votes on pending projects
          // TODO: Currently there's a notification for each vote, resulting in too many notifications for pending projects. This feature needs optimization
          case 'proposalSupported':
            return {
              type,
              title: 'Your proposal has been supported',
              itemKey: notification.itemProposal?.key ?? '',
              itemName: resolveItemLabel(notification.itemProposal?.key),
              projectName,
              userName: voterProfile?.name || 'someone',
              buttonText: 'View Proposal',
              actor: voterProfile,
              actorIsSelf,
              voter: voterProfile,
            };
          // For item votes on published projects
          case 'itemProposalPassed':
            return {
              type,
              title: 'Your item proposal has passed',
              itemKey: notification.itemProposal?.key ?? '',
              itemName: resolveItemLabel(notification.itemProposal?.key),
              projectName,
              userName: voterProfile?.name || 'someone',
              buttonText: 'View Submission',
              actor: actorProfile,
              actorIsSelf,
            };
          // Project proposal published successfully, but without reward points, showing "View Published Project" entry
          case 'proposalPassed':
            return {
              type,
              title: 'Your proposal has passed!',
              projectName,
              buttonText: 'View Published Project',
              hasMultipleActions: false,
              actor: actorProfile,
              actorIsSelf,
            };
          // Project published successfully, same as proposalPassed type, showing "View Published Project" entry, but with different text
          case 'projectPublished':
            return {
              type,
              title: 'Project has been published',
              projectName,
              buttonText: 'View Published Project',
            };
          // Create project -> contributionPoints
          // TODO: UI can add createProposal type, redirecting to project/pending/[projectId]/proposal/[proposal] page
          case 'createProposal':
            return {
              type: 'createProposal' as FrontendNotificationType,
              title: ownerIsSelf
                ? 'You created a proposal'
                : `${ownerDisplayName} created a proposal`,
              projectName,
              buttonText: '',
              hideButton: true,
              actor: actorProfile,
              actorIsSelf,
            };
          // Project published successfully, with reward points, showing `contributionPoints` type
          case 'proposalPass':
            return {
              type,
              title: 'Your proposal has passed!',
              projectName,
              buttonText: 'View Published Project',
              itemName: String(notification.reward),
              hasMultipleActions: false,
              actor: actorProfile,
              actorIsSelf,
            };
          // Only create not essential item will be notified -> contributionPoints
          case 'createItemProposal':
            return {
              type: 'createItemProposal' as FrontendNotificationType,
              title: ownerIsSelf
                ? 'You created a new input'
                : `${ownerDisplayName} created a new input`,
              itemKey: notification.itemProposal?.key ?? '',
              itemName: resolveItemLabel(notification.itemProposal?.key),
              projectName,
              buttonText: '',
              hideButton: true,
              actor: actorProfile,
              actorIsSelf,
            };
          case 'itemProposalPass':
            return {
              type: 'contributionPoints' as FrontendNotificationType,
              title: 'You have gained contribution points',
              itemName: String(notification.reward),
              buttonText: '',
              hideButton: true,
              actor: actorProfile,
              actorIsSelf,
            };
          case 'systemUpdate':
          case 'newItemsAvailable': {
            const parsedMetadata = parseNotificationMetadata(
              notification.metadata ?? null,
            );
            const fallbackTitle =
              type === 'systemUpdate'
                ? 'System update available'
                : 'New items available';
            const fallbackDescription =
              type === 'systemUpdate'
                ? "We've made some updates to the platform"
                : 'New items are available for proposals';

            const { label: metadataCtaLabel, url: metadataCtaUrl } =
              resolveMetadataCta(parsedMetadata, {
                label: 'View Details',
              });

            const hasCta = Boolean(metadataCtaLabel && metadataCtaUrl);

            const resolvedTargetUrl = hasCta
              ? resolveMetadataNavigationUrl(parsedMetadata, metadataCtaUrl)
              : resolveMetadataNavigationUrl(parsedMetadata);

            const hideButton = !hasCta;
            const buttonText = hasCta
              ? (metadataCtaLabel ?? 'View Details')
              : '';

            return {
              type,
              title: resolveMetadataTitle(parsedMetadata, fallbackTitle),
              description: resolveMetadataBody(
                parsedMetadata,
                fallbackDescription,
              ),
              buttonText,
              hideButton,
              metadata: parsedMetadata.raw,
              metadataTitle: parsedMetadata.title,
              metadataBody: parsedMetadata.body,
              metadataExtra: parsedMetadata.extra ?? undefined,
              ctaLabel: hasCta ? (metadataCtaLabel ?? undefined) : undefined,
              ctaUrl: hasCta ? (metadataCtaUrl ?? undefined) : undefined,
              targetUrl: resolvedTargetUrl,
            };
          }
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
      const timeAgo = formatTimeAgo(notification.createdAt, {
        fallback: 'Just now',
      });

      return {
        id: notification.id.toString(),
        timeAgo,
        isRead,
        projectName,
        voter: voterProfile,
        actor: actorProfile,
        actorIsSelf,
        owner: ownerProfile,
        ownerIsSelf,
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
      .map(transformNotification)
      .filter((notification): notification is NotificationItemData =>
        Boolean(notification),
      );
  }, [allNotificationsData, transformNotification]);

  const unreadNotifications = useMemo(() => {
    if (!unreadNotificationsData?.pages) return [];
    return unreadNotificationsData.pages
      .flatMap((page) => page.notifications)
      .map(transformNotification)
      .filter((notification): notification is NotificationItemData =>
        Boolean(notification),
      );
  }, [unreadNotificationsData, transformNotification]);

  const archivedNotifications = useMemo(() => {
    if (!archivedNotificationsData?.pages) return [];
    return archivedNotificationsData.pages
      .flatMap((page) => page.notifications)
      .map(transformNotification)
      .filter((notification): notification is NotificationItemData =>
        Boolean(notification),
      );
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
        if (notification.type === 'harbergerSlotExpiring') {
          const primaryUrl =
            notification.primaryActionUrl ??
            notification.ctaUrl ??
            notification.targetUrl;
          const secondaryUrl =
            notification.secondaryActionUrl ??
            notification.targetUrl ??
            notification.ctaUrl;

          const destination = isSecondary ? secondaryUrl : primaryUrl;

          if (destination) {
            router.push(destination);
          }
          return;
        }

        if (
          notification.type === 'systemUpdate' ||
          notification.type === 'newItemsAvailable'
        ) {
          if (notification.targetUrl) {
            router.push(notification.targetUrl);
          } else if (notification.ctaUrl) {
            router.push(notification.ctaUrl);
          } else {
            router.push('/');
          }
          return;
        }

        const projectId = backendNotification?.projectId;
        const proposalId = backendNotification?.proposalId;

        switch (notification.type) {
          case 'itemProposalLostLeading':
          case 'itemProposalBecameLeading':
          case 'itemProposalSupported':
          case 'itemProposalPassed':
            if (projectId) {
              router.push(
                `/project/${projectId}?tab=profile&notificationType=viewSubmission&itemName=${notification.itemKey}`,
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
          case 'default':
            router.push('/');
            break;
        }
      };

      // Execute navigation
      handleNavigation();
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

      if (
        notification.type === 'harbergerSlotExpiring' &&
        notification.secondaryActionUrl
      ) {
        router.push(notification.secondaryActionUrl);
      }
    },
    [markAsReadMutation, isAuthenticated, router],
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

  const handleManualRefresh = useCallback(() => {
    Promise.all([refetchAll(), refetchUnread(), refetchArchived()]).catch(
      (error) => console.error('Error during manual refresh:', error),
    );
  }, [refetchAll, refetchUnread, refetchArchived]);

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
    handleManualRefresh,

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
  // if (MOCK_NOTIFICATIONS_ENABLED) {
  //   return useMockNotifications();
  // }

  return useRealNotifications();
};
