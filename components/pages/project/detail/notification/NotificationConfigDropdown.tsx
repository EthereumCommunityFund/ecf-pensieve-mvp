'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  cn,
} from '@heroui/react';
import { FC, useCallback, useState } from 'react';

import { Button } from '@/components/base';
import { EyeIcon } from '@/components/icons/EyeIcon';

type NotificationType = 'myContributions' | 'allEvents';

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

interface IProps {
  className?: string;
}

const NotificationConfigDropdown: FC<IProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedType, setSelectedType] =
    useState<NotificationType>('myContributions');

  const selectMyContribution = selectedType === 'myContributions';
  const selectAllEvent = selectedType === 'allEvents';

  const onMuteAll = useCallback(() => {
    setIsMuted((pre) => !pre);
    setTimeout(() => setIsOpen(false), 100);
  }, []);

  const onCheck = useCallback(
    (type: NotificationType) => {
      if (isMuted) return;
      setSelectedType(type);
      // Close dropdown after selection
      setTimeout(() => setIsOpen(false), 100);
    },
    [isMuted],
  );

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
                      Notify me of all activity for this project page
                    </span>
                  </div>
                  <div onClick={onMuteAll} className="cursor-pointer">
                    <CheckboxIcon checked={isMuted} />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div
                className={cn(
                  isMuted ? 'opacity-50' : '',
                  'flex flex-col gap-[10px]',
                )}
              >
                {/* Only my contributions in-page */}
                <div
                  className={cn(
                    'rounded-md border border-black/10 transition-colors',
                    selectMyContribution ? 'bg-[#F5F5F5]' : 'bg-white',
                    isMuted ? 'cursor-not-allowed' : 'cursor-pointer ',
                  )}
                  onClick={() => onCheck('myContributions')}
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
                </div>

                {/* All events in project */}
                <div
                  className={cn(
                    'rounded-md border border-black/10 transition-colors',
                    selectAllEvent ? 'bg-[#F5F5F5]' : 'bg-white',
                    isMuted ? 'cursor-not-allowed' : 'cursor-pointer ',
                  )}
                  onClick={() => onCheck('allEvents')}
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
                </div>
              </div>
            </div>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationConfigDropdown;
