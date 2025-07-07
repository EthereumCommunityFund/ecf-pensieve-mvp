'use client';

import React from 'react';

export interface NotificationHeaderProps {
  totalCount: number;
  onMarkAllAsRead?: () => void;
  isMarkingAsRead?: boolean;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  totalCount,
  onMarkAllAsRead,
  isMarkingAsRead = false,
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
        disabled={isMarkingAsRead}
        className="flex items-center gap-1 text-[12px] leading-[16px] text-black opacity-50 transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isMarkingAsRead && (
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
        {isMarkingAsRead ? 'Marking...' : 'Mark all as read'}
      </button>
    </div>
  );
};
