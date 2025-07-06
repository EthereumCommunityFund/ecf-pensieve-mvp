'use client';

import React from 'react';

import { Button } from '../base/button';

export interface NotificationActionsProps {
  onSettings?: () => void;
  onArchiveAll?: () => void;
}

export const NotificationActions: React.FC<NotificationActionsProps> = ({
  onSettings,
  onArchiveAll,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 flex w-[380px] items-center justify-end gap-2.5 border-t border-black/10 bg-[rgba(255,255,255,0.9)] p-[14px] backdrop-blur-[10px]">
      <Button
        size="sm"
        onPress={onSettings}
        className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
      >
        Settings
      </Button>

      <Button
        size="sm"
        onPress={onArchiveAll}
        className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
      >
        Archive All
      </Button>
    </div>
  );
};
