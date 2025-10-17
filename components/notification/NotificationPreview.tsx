import { useMemo } from 'react';

import {
  FrontendNotificationType,
  NotificationItem,
  NotificationItemData,
} from './NotificationItem';

export type NotificationPreviewInput = Partial<
  Omit<NotificationItemData, 'type' | 'id' | 'buttonText' | 'timeAgo'>
> & {
  type: FrontendNotificationType;
  id?: string;
  buttonText?: string;
  timeAgo?: string;
};

const DEFAULT_PREVIEW_ID = 'notification-preview';
const DEFAULT_PREVIEW_TITLE = 'Notification preview';
const DEFAULT_PREVIEW_TIME = 'Just now';

const buildButtonVisibility = (
  input: NotificationPreviewInput,
  buttonText: string,
): boolean => {
  if (typeof input.hideButton === 'boolean') {
    return input.hideButton;
  }

  return buttonText.length === 0;
};

export const buildNotificationPreviewItem = (
  input: NotificationPreviewInput,
): NotificationItemData => {
  const buttonText = input.buttonText ?? '';

  return {
    id: input.id ?? DEFAULT_PREVIEW_ID,
    type: input.type,
    title: input.title ?? DEFAULT_PREVIEW_TITLE,
    description: input.description,
    itemName: input.itemName,
    projectName: input.projectName,
    userName: input.userName,
    voter: input.voter,
    actor: input.actor,
    owner: input.owner,
    timeAgo: input.timeAgo ?? DEFAULT_PREVIEW_TIME,
    buttonText,
    isRead: input.isRead ?? true,
    hasMultipleActions: input.hasMultipleActions,
    secondaryButtonText: input.secondaryButtonText,
    hideButton: buildButtonVisibility(input, buttonText),
    actorIsSelf: input.actorIsSelf,
    ownerIsSelf: input.ownerIsSelf,
    metadata: input.metadata ?? null,
    metadataTitle: input.metadataTitle,
    metadataBody: input.metadataBody,
    metadataExtra: input.metadataExtra,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    targetUrl: input.targetUrl,
    targetProjectId: input.targetProjectId,
    targetItemId: input.targetItemId,
  };
};

export const NotificationPreview = ({
  data,
  className,
}: {
  data: NotificationPreviewInput;
  className?: string;
}) => {
  const itemData = useMemo(() => buildNotificationPreviewItem(data), [data]);

  return (
    <div className={className}>
      <NotificationItem itemData={itemData} />
    </div>
  );
};
