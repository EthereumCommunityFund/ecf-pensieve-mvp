import { and, eq, inArray } from 'drizzle-orm';

import { db } from '@/lib/db';
import { projectNotificationSettings } from '@/lib/db/schema';

import type { NotificationType } from '../notification';

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

  const settings = await db
    .select({
      userId: projectNotificationSettings.userId,
      notificationMode: projectNotificationSettings.notificationMode,
    })
    .from(projectNotificationSettings)
    .where(
      and(
        inArray(projectNotificationSettings.userId, userIds),
        eq(projectNotificationSettings.projectId, projectId),
      ),
    );

  const settingsMap = new Map<string, NotificationMode>();

  settings.forEach((setting) => {
    settingsMap.set(
      setting.userId,
      setting.notificationMode as NotificationMode,
    );
  });

  userIds.forEach((userId) => {
    if (!settingsMap.has(userId)) {
      settingsMap.set(userId, 'all_events');
    }
  });

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
      MY_CONTRIBUTION_NOTIFICATION_TYPES.includes(notificationType);

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

export async function filterRecipientsBySettings(
  recipients: string[],
  projectId: number,
  notificationType: NotificationType,
  contextMap?: Map<
    string,
    Omit<FilterContext, 'userId' | 'notificationType' | 'projectId'>
  >,
): Promise<string[]> {
  if (recipients.length === 0) {
    return [];
  }

  const settingsMap = await getUserNotificationSettings(recipients, projectId);

  return recipients.filter((userId) => {
    const mode = settingsMap.get(userId) || 'all_events';
    const context = contextMap?.get(userId) || {};

    return shouldSendNotification(mode, notificationType, context);
  });
}

export async function batchFilterRecipients(
  notificationBatches: Array<{
    recipients: string[];
    projectId: number;
    notificationType: NotificationType;
    contextMap?: Map<
      string,
      Omit<FilterContext, 'userId' | 'notificationType' | 'projectId'>
    >;
  }>,
): Promise<Map<number, string[]>> {
  const results = new Map<number, string[]>();

  for (let i = 0; i < notificationBatches.length; i++) {
    const batch = notificationBatches[i];
    const filteredRecipients = await filterRecipientsBySettings(
      batch.recipients,
      batch.projectId,
      batch.notificationType,
      batch.contextMap,
    );
    results.set(i, filteredRecipients);
  }

  return results;
}

export async function getNotificationRecipientsSummary(
  recipients: string[],
  projectId: number,
  notificationType: NotificationType,
): Promise<{
  total: number;
  muted: number;
  myContributions: number;
  allEvents: number;
  willReceive: number;
}> {
  const settingsMap = await getUserNotificationSettings(recipients, projectId);

  let muted = 0;
  let myContributions = 0;
  let allEvents = 0;
  let willReceive = 0;

  recipients.forEach((userId) => {
    const mode = settingsMap.get(userId) || 'all_events';

    switch (mode) {
      case 'muted':
        muted++;
        break;
      case 'my_contributions':
        myContributions++;
        if (MY_CONTRIBUTION_NOTIFICATION_TYPES.includes(notificationType)) {
          willReceive++;
        }
        break;
      case 'all_events':
        allEvents++;
        willReceive++;
        break;
    }
  });

  return {
    total: recipients.length,
    muted,
    myContributions,
    allEvents,
    willReceive,
  };
}
