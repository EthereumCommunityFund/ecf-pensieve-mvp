import { and, eq, inArray } from 'drizzle-orm';

import { db } from '@/lib/db';
import { projectNotificationSettings } from '@/lib/db/schema';

import type { NotificationType } from '../notification';

import { notificationCache } from './cache';

export type NotificationMode = 'muted' | 'my_contributions' | 'all_events';

const MY_CONTRIBUTION_NOTIFICATION_TYPES: NotificationType[] = [
  'itemProposalPass',
  'itemProposalBecameLeading',
  'itemProposalLostLeading',
  'itemProposalSupported',
  'itemProposalPassed',
];

export interface UserNotificationSetting {
  userId: string;
  notificationMode: NotificationMode;
}

export async function getUserNotificationSettings(
  userIds: string[],
  projectId: number,
): Promise<Map<string, NotificationMode>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const settingsMap = new Map<string, NotificationMode>();
  const uncachedUserIds: string[] = [];

  for (const userId of userIds) {
    const cachedMode = notificationCache.getUserSetting(userId, projectId);
    if (cachedMode !== null) {
      settingsMap.set(userId, cachedMode);
    } else {
      uncachedUserIds.push(userId);
    }
  }

  if (uncachedUserIds.length > 0) {
    const settings = await db
      .select({
        userId: projectNotificationSettings.userId,
        notificationMode: projectNotificationSettings.notificationMode,
      })
      .from(projectNotificationSettings)
      .where(
        and(
          inArray(projectNotificationSettings.userId, uncachedUserIds),
          eq(projectNotificationSettings.projectId, projectId),
        ),
      );

    settings.forEach((setting) => {
      const mode = setting.notificationMode as NotificationMode;
      settingsMap.set(setting.userId, mode);
      notificationCache.setUserSetting(setting.userId, projectId, mode);
    });
  }

  return settingsMap;
}

export function shouldSendNotification(
  notificationMode: NotificationMode,
  notificationType: NotificationType,
  context: {
    isCreator?: boolean;
    isVoter?: boolean;
    isProjectOwner?: boolean;
  },
): boolean {
  if (notificationMode === 'muted') {
    return false;
  }

  if (notificationMode === 'all_events') {
    return true;
  }

  if (notificationMode === 'my_contributions') {
    const isContributionNotification =
      notificationType !== 'createItemProposal';

    if (isContributionNotification) {
      return (
        context.isCreator || context.isVoter || context.isProjectOwner || false
      );
    }

    return context.isCreator || false;
  }

  return true;
}

export interface FilterContext {
  userId: string;
  notificationType: NotificationType;
  projectId: number;
  isCreator?: boolean;
  isVoter?: boolean;
  isProjectOwner?: boolean;
}

export async function filterUsersBySettings(
  users: string[],
  projectId: number,
  notificationType: NotificationType,
  contextMap?: Map<
    string,
    Omit<FilterContext, 'userId' | 'notificationType' | 'projectId'>
  >,
): Promise<string[]> {
  if (users.length === 0) {
    return [];
  }

  const settingsMap = await getUserNotificationSettings(users, projectId);

  return users.filter((userId) => {
    const mode = settingsMap.get(userId) || 'my_contributions';
    const context = contextMap?.get(userId) || {};

    return shouldSendNotification(mode, notificationType, context);
  });
}
