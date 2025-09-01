'use client';

import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from '@heroui/react';
import { FC, memo, useCallback, useEffect, useState } from 'react';

import { addToast, Button } from '@/components/base';
import { EyeIcon } from '@/components/icons/EyeIcon';
import {
  NotificationConfigDropdownProps,
  NotificationMode,
} from '@/components/pages/project/detail/notification/notification';
import { getErrorMessage } from '@/components/pages/project/detail/notification/notificationError';
import { useAuth } from '@/context/AuthContext';

import { useNotificationSettings } from './useNotificationSettings';

const CheckboxIcon = ({ checked }: { checked: boolean }) => {
  return checked ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath="url(#clip0_5334_13487)">
        <path
          d="M19.5 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H19.5C19.8978 21 20.2794 20.842 20.5607 20.5607C20.842 20.2794 21 19.8978 21 19.5V4.5C21 4.10218 20.842 3.72064 20.5607 3.43934C20.2794 3.15804 19.8978 3 19.5 3ZM16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1217 15.6557 10.039 15.6004 9.96937 15.5306L7.71937 13.2806C7.57864 13.1399 7.49958 12.949 7.49958 12.75C7.49958 12.551 7.57864 12.3601 7.71937 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44902 11.9996 8.63989 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.2891 9.14969 15.3718 9.09442 15.4628 9.0567C15.5539 9.01899 15.6515 8.99958 15.75 8.99958C15.8485 8.99958 15.9461 9.01899 16.0372 9.0567C16.1282 9.09442 16.2109 9.14969 16.2806 9.21937C16.3503 9.28906 16.4056 9.37178 16.4433 9.46283C16.481 9.55387 16.5004 9.65145 16.5004 9.75C16.5004 9.84855 16.481 9.94613 16.4433 10.0372C16.4056 10.1282 16.3503 10.2109 16.2806 10.2806Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_5334_13487">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g opacity="0.3" clipPath="url(#clip0_5334_13366)">
        <path
          d="M19.5 3.75H4.5C4.08579 3.75 3.75 4.08579 3.75 4.5V19.5C3.75 19.9142 4.08579 20.25 4.5 20.25H19.5C19.9142 20.25 20.25 19.9142 20.25 19.5V4.5C20.25 4.08579 19.9142 3.75 19.5 3.75Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_5334_13366">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

const CheckIcon = ({ checked }: { checked: boolean }) => {
  return (
    <div className={checked ? '' : 'opacity-10'}>
      {checked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <g clipPath="url(#clip0_5324_9205)">
            <path
              d="M2.5 9L6 12.5L14 4.5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_5324_9205">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <g clipPath="url(#clip0_5324_9205)">
            <path
              d="M2.5 9L6 12.5L14 4.5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_5324_9205">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )}
    </div>
  );
};

const NotificationConfigDropdown: FC<NotificationConfigDropdownProps> = ({
  projectId,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();

  // Use the notification settings hook
  const { setting, isLoading, error, updateSetting, isUpdating } =
    useNotificationSettings(projectId);

  // Determine the current notification mode
  const currentMode = setting?.notificationMode || 'my_contributions';
  const isMuted = currentMode === 'muted';
  const selectMyContribution = currentMode === 'my_contributions';
  const selectAllEvent = currentMode === 'all_events';

  // Handle mute all toggle
  const onMuteAll = useCallback(() => {
    const newMode: NotificationMode = isMuted ? 'my_contributions' : 'muted';
    updateSetting(newMode);

    addToast({
      title: isMuted
        ? 'Notifications enabled for my contributions'
        : 'All notifications muted',
      color: 'success',
    });

    // Close dropdown after a short delay
    setTimeout(() => setIsOpen(false), 500);
  }, [isMuted, updateSetting]);

  // Handle notification type selection
  const onCheck = useCallback(
    (type: 'myContributions' | 'allEvents') => {
      const modeMap: Record<string, NotificationMode> = {
        myContributions: 'my_contributions',
        allEvents: 'all_events',
      };

      updateSetting(modeMap[type]);

      const messageMap = {
        myContributions: 'Notifications set to your contributions only',
        allEvents: 'Notifications enabled for all events',
      };

      addToast({
        title: messageMap[type],
        color: 'success',
      });

      // Close dropdown after selection
      setTimeout(() => setIsOpen(false), 500);
    },
    [updateSetting],
  );

  // Show error if any
  useEffect(() => {
    if (error) {
      addToast({
        title: getErrorMessage(error),
        color: 'danger',
      });
    }
  }, [error]);

  // Don't show the button if user is not logged in
  if (!profile) {
    return null;
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      classNames={{
        content: 'p-0 min-w-[400px]',
      }}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          disabled={disabled || isLoading}
          isLoading={isLoading}
          className={cn(
            'rounded-[4px] bg-black/5 hover:bg-black/10 size-[40px] p-[8px] mobile:size-[32px] mobile:p-[6px]',
            className,
          )}
        >
          <EyeIcon />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notification settings"
        className="p-0"
        itemClasses={{
          base: 'p-0 hover:bg-transparent data-[hover=true]:bg-transparent',
        }}
      >
        <DropdownItem
          key="content"
          textValue="notification-settings"
          className="p-0"
          isReadOnly
        >
          <div className="rounded-lg bg-white">
            {/* Header */}
            <div className="border-b border-black/10 px-[20px] py-[10px]">
              <h3 className="text-[16px] font-semibold text-black">
                Watch & Receive Notifications
              </h3>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-[10px] p-[10px]">
              {/* Mute All Notifications */}
              <div className="rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[5px]">
                    <span className="text-[14px] font-semibold text-black">
                      Mute All Notifications
                    </span>
                    <span className="text-[12px] text-black/70">
                      Stop receiving notifications for this project
                    </span>
                  </div>
                  <button
                    onClick={onMuteAll}
                    className="cursor-pointer disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Spinner size="sm" className="size-[24px]" />
                    ) : (
                      <CheckboxIcon checked={isMuted} />
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div
                className={cn(
                  isUpdating ? 'opacity-50' : '',
                  'flex flex-col gap-[10px]',
                )}
              >
                {/* Only my contributions in-page */}
                <button
                  className={cn(
                    'rounded-md border border-black/10 transition-colors text-left w-full',
                    selectMyContribution && !isMuted
                      ? 'bg-[#F5F5F5]'
                      : 'bg-white',
                    isUpdating
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-50',
                  )}
                  onClick={() => onCheck('myContributions')}
                  disabled={isUpdating}
                >
                  <div className="flex items-center justify-between px-[14px] py-[10px]">
                    <div className="flex flex-col gap-[5px]">
                      <span className="text-[14px] font-semibold text-black">
                        Only my contributions in-page
                      </span>
                      <span className="text-[12px] text-black/50">
                        Notify me of activities only when I contribute to this
                        page
                      </span>
                    </div>
                    <CheckIcon checked={selectMyContribution && !isMuted} />
                  </div>
                </button>

                {/* All events in project */}
                <button
                  className={cn(
                    'rounded-md border border-black/10 transition-colors text-left w-full',
                    selectAllEvent && !isMuted ? 'bg-[#F5F5F5]' : 'bg-white',
                    isUpdating
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-50',
                  )}
                  onClick={() => onCheck('allEvents')}
                  disabled={isUpdating}
                >
                  <div className="flex items-center justify-between px-[14px] py-[10px]">
                    <div className="flex flex-col gap-[5px]">
                      <span className="text-[14px] font-semibold text-black">
                        All events in project
                      </span>
                      <span className="text-[12px] text-black/50">
                        Notify me of all activity for this project page
                      </span>
                    </div>
                    <CheckIcon checked={selectAllEvent && !isMuted} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default memo(NotificationConfigDropdown);
