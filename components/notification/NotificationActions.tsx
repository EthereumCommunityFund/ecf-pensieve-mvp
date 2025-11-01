'use client';

import React, { useState } from 'react';

import { isDev } from '@/constants/env';

import { Button } from '../base/button';
import { addToast } from '../base/toast';

export interface NotificationActionsProps {
  onSettings?: () => void;
  onArchiveAll?: () => void;
  isArchivingAll?: boolean;
  onRefreshNotifications?: () => void;
}

export const NotificationActions: React.FC<NotificationActionsProps> = ({
  onSettings,
  onArchiveAll,
  isArchivingAll = false,
  onRefreshNotifications,
}) => {
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const showCronButton =
    isDev && process.env.NEXT_PUBLIC_SHOW_NOTIFICATION_CRON === 'true';

  const handleTriggerCron = async () => {
    setIsTriggeringCron(true);
    try {
      const response = await fetch('/api/cron/processNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        addToast({
          title: 'Notification cron job triggered successfully',
          color: 'success',
        });

        if (onRefreshNotifications) {
          setTimeout(() => {
            onRefreshNotifications();
          }, 500);
        }
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to trigger cron job:', error);
      addToast({
        title: 'Failed to trigger notification cron job',
        color: 'danger',
      });
    } finally {
      setIsTriggeringCron(false);
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 flex w-[380px] items-center justify-end gap-2.5 border-t border-black/10 bg-[rgba(255,255,255,0.9)] p-[14px] backdrop-blur-[10px]">
      {/* <Button
        size="sm"
        onPress={onSettings}
        className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
      >
        Settings
      </Button> */}

      {showCronButton && (
        <Button
          size="sm"
          onPress={handleTriggerCron}
          isDisabled={isTriggeringCron}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTriggeringCron ? 'Triggering...' : 'Trigger Cron'}
        </Button>
      )}

      <Button
        size="sm"
        onPress={onArchiveAll}
        isDisabled={isArchivingAll}
        className="border-none bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex items-center gap-1">
          {isArchivingAll && (
            <svg
              className="size-3 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          )}
          {isArchivingAll ? 'Archiving...' : 'Archive All'}
        </div>
      </Button>
    </div>
  );
};
