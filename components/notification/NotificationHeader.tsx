'use client';

import React from 'react';

export interface NotificationHeaderProps {
  totalCount: number;
  onMarkAllAsRead?: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  totalCount,
  onMarkAllAsRead,
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-5 p-[14px]">
      <div className="flex h-[22px] w-[187.5px] items-center gap-2.5">
        <span className="text-[16px] font-semibold leading-[22px] tracking-[1.76%] text-black">
          Notifications
        </span>
        <span className="text-[14px] font-semibold leading-[19px] text-black opacity-30">
          {totalCount}
        </span>
      </div>

      <button
        onClick={onMarkAllAsRead}
        className="text-[12px] leading-[16px] text-black opacity-50 transition-opacity hover:opacity-75"
      >
        Mark all as read
      </button>
    </div>
  );
};
