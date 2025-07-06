'use client';

import React from 'react';

import { Button } from '../base/button';
import {
  CaretDoubleDownIcon,
  CaretDoubleUpIcon,
  CoinsIcon,
  LegoIcon,
  MegaphoneIcon,
  PencilCircleIcon,
  SealCheckIcon,
  ThumbsUpIcon,
} from '../icons';

export interface NotificationItemProps {
  id: string;
  type:
    | 'itemProposalLostLeading'
    | 'itemProposalBecameLeading'
    | 'itemProposalSupported'
    | 'systemUpdate'
    | 'newItemsAvailable'
    | 'proposalPassed'
    | 'projectPublished'
    | 'contributionPoints'
    | 'default';
  title: string;
  itemName?: string;
  projectName?: string;
  userName?: string;
  timeAgo: string;
  buttonText: string;
  isRead?: boolean;
  hasMultipleActions?: boolean;
  secondaryButtonText?: string;
  onButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
}

const getIconForType = (type: NotificationItemProps['type']) => {
  switch (type) {
    case 'itemProposalLostLeading':
      return <CaretDoubleDownIcon size={32} className="opacity-30" />;
    case 'itemProposalBecameLeading':
      return <CaretDoubleUpIcon size={32} />;
    case 'itemProposalSupported':
      return <ThumbsUpIcon size={32} />;
    case 'systemUpdate':
      return <MegaphoneIcon size={32} />;
    case 'newItemsAvailable':
      return <LegoIcon size={32} />;
    case 'proposalPassed':
      return <SealCheckIcon size={32} />;
    case 'projectPublished':
      return <PencilCircleIcon size={32} />;
    case 'contributionPoints':
      return <CoinsIcon size={32} />;
    default:
      return <PencilCircleIcon size={32} className="opacity-30" />;
  }
};

const formatNotificationText = (props: NotificationItemProps) => {
  const { type, title, itemName, projectName, userName } = props;

  switch (type) {
    case 'itemProposalLostLeading':
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[14px] leading-[20px] text-black">
            Your input has lost sufficient support
          </span>
          {itemName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {itemName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {projectName}
              </span>
            </div>
          )}
        </div>
      );
    case 'itemProposalBecameLeading':
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[14px] leading-[20px] text-black">
            Your input for
          </span>
          {itemName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {itemName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {projectName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black">
            is now leading
          </span>
        </div>
      );
    case 'itemProposalSupported':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {userName && (
            <div className="inline-flex items-center justify-center gap-1 rounded-[10px] bg-[#F5F5F5] px-1">
              <div className="size-5 rounded-full bg-[#A1A1A1]" />
              <span className="text-[13px] leading-[18px] text-black">
                {userName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black">
            has supported your input for
          </span>
          {itemName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {itemName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {projectName}
              </span>
            </div>
          )}
        </div>
      );
    case 'proposalPassed':
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[14px] leading-[20px] text-black">
            Your proposal for
          </span>
          {projectName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {projectName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black">
            has passed!
          </span>
        </div>
      );
    case 'projectPublished':
      return (
        <div className="flex w-[310px] flex-wrap items-center gap-1">
          <span className="text-[14px] leading-[20px] text-black">
            The pending project
          </span>
          {projectName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {projectName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black">
            you have contributed to has now been published
          </span>
        </div>
      );
    case 'contributionPoints':
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[14px] leading-[20px] text-black">
            You have gained
          </span>
          {itemName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {itemName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black">
            Contribution Points
          </span>
        </div>
      );
    default:
      return (
        <span className="text-[14px] leading-[20px] text-black">{title}</span>
      );
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = (props) => {
  const {
    type,
    timeAgo,
    buttonText,
    isRead = false,
    hasMultipleActions = false,
    secondaryButtonText,
    onButtonClick,
    onSecondaryButtonClick,
  } = props;

  const handlePrimaryAction = () => {
    onButtonClick?.();
  };

  const handleSecondaryAction = () => {
    onSecondaryButtonClick?.();
  };

  const bgColor = isRead
    ? 'bg-[rgba(104,198,172,0.05)]'
    : 'bg-[rgba(104,198,172,0.05)]';
  const borderClass = isRead
    ? 'border-b border-black/10'
    : 'border-b border-black/10';

  return (
    <div
      className={`flex flex-col gap-[30px] p-[14px] ${bgColor} ${borderClass}`}
    >
      <div className="flex w-full items-start gap-2.5">
        {/* Icon */}
        <div className="size-8 shrink-0">{getIconForType(type)}</div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2.5">
          {/* Text Content */}
          <div className="flex flex-col gap-2.5">
            <div className="flex w-full items-start justify-between gap-5">
              {formatNotificationText(props)}
            </div>

            {/* Time */}
            <span className="text-[12px] font-semibold leading-[12px] text-black opacity-50">
              {timeAgo}
            </span>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              {hasMultipleActions && secondaryButtonText ? (
                <>
                  <Button
                    size="sm"
                    onPress={handlePrimaryAction}
                    className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
                  >
                    {buttonText}
                  </Button>
                  <Button
                    size="sm"
                    onPress={handleSecondaryAction}
                    className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
                  >
                    {secondaryButtonText}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onPress={handlePrimaryAction}
                  className="bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
                >
                  {buttonText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
