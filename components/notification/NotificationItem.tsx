'use client';

import { Image } from '@heroui/react';
import React from 'react';

import { NotificationType } from '@/lib/services/notification';
import { IPocItemKey } from '@/types/item';
import type { NotificationMetadata } from '@/types/notification';

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

export type FrontendNotificationType =
  | NotificationType
  | 'default'
  | 'contributionPoints';

export interface IVoterOfNotification {
  address: string;
  name: string;
  avatarUrl?: string | null;
  userId: string;
}

export interface NotificationItemData {
  id: string;
  type: FrontendNotificationType;
  title: string;
  description?: string;
  itemKey?: IPocItemKey;
  itemName?: string;
  projectName?: string;
  userName?: string;
  voter?: IVoterOfNotification;
  actor?: IVoterOfNotification;
  owner?: IVoterOfNotification;
  timeAgo: string;
  buttonText: string;
  isRead?: boolean;
  hasMultipleActions?: boolean;
  secondaryButtonText?: string;
  hideButton?: boolean;
  actorIsSelf?: boolean;
  ownerIsSelf?: boolean;
  metadata?: NotificationMetadata | null;
  metadataTitle?: string;
  metadataBody?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  targetUrl?: string;
  targetProjectId?: number;
  targetItemId?: number;
  metadataExtra?: Record<string, unknown>;
}

export interface NotificationItemProps {
  itemData: NotificationItemData;
  onButtonClick?: (itemData: NotificationItemData) => void;
  onSecondaryButtonClick?: (itemData: NotificationItemData) => void;
  onNotificationClick?: (itemData: NotificationItemData) => void;
}

const getIconForType = (type: FrontendNotificationType) => {
  switch (type) {
    case 'itemProposalLostLeading':
      return <CaretDoubleDownIcon size={32} className="opacity-30" />;
    case 'itemProposalBecameLeading':
      return <CaretDoubleUpIcon size={32} />;
    case 'itemProposalSupported':
    case 'proposalSupported':
      return <ThumbsUpIcon size={32} />;
    case 'systemUpdate':
      return <MegaphoneIcon size={32} />;
    case 'newItemsAvailable':
      return <LegoIcon size={32} />;
    case 'proposalPassed':
    case 'itemProposalPassed':
    case 'itemProposalPass':
    case 'proposalPass':
      return <SealCheckIcon size={32} />;
    case 'projectPublished':
    case 'createProposal':
    case 'createItemProposal':
      return <PencilCircleIcon size={32} />;
    case 'contributionPoints':
      return <CoinsIcon size={32} />;
    default:
      return <PencilCircleIcon size={32} className="opacity-30" />;
  }
};

const VoterAvatar = ({
  voter,
  actorIsSelf,
}: {
  voter?: IVoterOfNotification;
  actorIsSelf?: boolean;
}) => {
  return actorIsSelf ? (
    'You'
  ) : voter ? (
    <div className="inline-flex h-[28px] items-center justify-center gap-[5px] rounded-[10px] bg-[#F5F5F5] p-[4px]">
      <Image
        src={voter.avatarUrl || '/images/user/avatar_p.png'}
        alt={voter.name}
        width={20}
        height={20}
        className="size-[20px] rounded-full object-cover"
      />
      <span className="text-[13px] leading-[18px] text-black">
        {voter.name}
      </span>
    </div>
  ) : (
    <div>someone</div>
  );
};

const formatNotificationText = (itemData: NotificationItemData) => {
  const {
    type,
    title,
    description,
    itemName,
    projectName,
    actor,
    actorIsSelf,
    owner,
    ownerIsSelf,
  } = itemData;

  const itemChip = itemName && (
    <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
      <span className="text-[13px] leading-[18px] text-black">{itemName}</span>
    </div>
  );

  const projectChip = projectName && (
    <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
      <span className="text-[13px] leading-[18px] text-black">
        {projectName}
      </span>
    </div>
  );

  const renderOwnerDescriptor = (noun: string) => {
    if (ownerIsSelf) {
      return (
        <span className="text-[14px] leading-[20px] text-black">
          {`Your ${noun}`}
        </span>
      );
    }

    if (owner) {
      return (
        <>
          <span className="text-[14px] leading-[20px] text-black">
            {`The ${noun} from`}
          </span>
          <VoterAvatar voter={owner} actorIsSelf={false} />
        </>
      );
    }

    return (
      <span className="text-[14px] leading-[20px] text-black">
        {`The ${noun}`}
      </span>
    );
  };

  const renderActorStatement = (selfText: string, otherText: string) => {
    if (actor && actorIsSelf) {
      return (
        <span className="text-[14px] leading-[20px] text-black">
          {selfText}
        </span>
      );
    }

    if (actor) {
      return (
        <>
          <VoterAvatar voter={actor} actorIsSelf={actorIsSelf} />
          <span className="text-[14px] leading-[20px] text-black">
            {otherText}
          </span>
        </>
      );
    }

    return (
      <span className="text-[14px] leading-[20px] text-black">{otherText}</span>
    );
  };

  const renderSupportOwnerPhrase = () => {
    if (ownerIsSelf) {
      return (
        <span className="text-[14px] leading-[20px] text-black">
          {actorIsSelf ? 'supported your input' : 'has supported your input'}
        </span>
      );
    }

    if (owner) {
      return (
        <>
          <span className="text-[14px] leading-[20px] text-black">
            {actorIsSelf
              ? 'supported the input from'
              : 'has supported the input from'}
          </span>
          <VoterAvatar voter={owner} actorIsSelf={false} />
        </>
      );
    }

    return (
      <span className="text-[14px] leading-[20px] text-black">
        {actorIsSelf ? 'supported the input' : 'has supported the input'}
      </span>
    );
  };

  const renderProposalSupportPhrase = () => {
    if (ownerIsSelf) {
      return (
        <span className="text-[14px] leading-[20px] text-black">
          {actorIsSelf
            ? 'have supported your proposal for'
            : 'has supported your proposal for'}
        </span>
      );
    }

    if (owner) {
      return (
        <>
          <span className="text-[14px] leading-[20px] text-black">
            {actorIsSelf
              ? 'have supported the proposal from'
              : 'has supported the proposal from'}
          </span>
          <VoterAvatar voter={owner} actorIsSelf={false} />
          <span className="text-[14px] leading-[20px] text-black">for</span>
        </>
      );
    }

    return (
      <span className="text-[14px] leading-[20px] text-black">
        {actorIsSelf
          ? 'have supported the proposal for'
          : 'has supported the proposal for'}
      </span>
    );
  };

  switch (type) {
    case 'itemProposalLostLeading':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {renderOwnerDescriptor('input')}
          {itemChip && (
            <>
              <span className="text-[14px] leading-[20px] text-black">for</span>
              {itemChip}
            </>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectChip}
          <span className="text-[14px] leading-[20px] text-black">
            has lost sufficient support
          </span>
        </div>
      );
    case 'itemProposalBecameLeading':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {renderOwnerDescriptor('input')}
          {itemChip && (
            <>
              <span className="text-[14px] leading-[20px] text-black">for</span>
              {itemChip}
            </>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectChip}
          <span className="text-[14px] leading-[20px] text-black">
            is now leading
          </span>
        </div>
      );
    case 'itemProposalSupported':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {actor ? (
            <>
              <VoterAvatar voter={actor} actorIsSelf={actorIsSelf} />
              {renderSupportOwnerPhrase()}
            </>
          ) : (
            <>
              {renderOwnerDescriptor('input')}
              <span className="text-[14px] leading-[20px] text-black">
                has been supported
              </span>
            </>
          )}
          {itemChip && (
            <>
              <span className="text-[14px] leading-[20px] text-black">for</span>
              {itemChip}
            </>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectChip}
        </div>
      );
    case 'proposalPassed':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {renderOwnerDescriptor('proposal')}
          {projectChip && (
            <>
              <span className="text-[14px] leading-[20px] text-black">for</span>
              {projectChip}
            </>
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
    case 'proposalPass':
    case 'contributionPoints':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {renderActorStatement('You have gained', 'has gained')}
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
    case 'systemUpdate':
    case 'newItemsAvailable':
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[14px] leading-[20px] text-black">{title}</span>
          {description && (
            <span className="text-[13px] leading-[18px] text-black/70">
              {description}
            </span>
          )}
        </div>
      );
    case 'createProposal':
      if (itemData.actorIsSelf) {
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
              has been created
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-wrap items-center gap-1">
          <VoterAvatar voter={itemData.actor} />
          <span className="text-[14px] leading-[20px] text-black">
            created a proposal for
          </span>
          {projectName && (
            <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-transparent px-2 py-0.5">
              <span className="text-[13px] leading-[18px] text-black">
                {projectName}
              </span>
            </div>
          )}
          <span className="text-[14px] leading-[20px] text-black">
            has been created
          </span>
        </div>
      );
    case 'createItemProposal':
      if (itemData.actorIsSelf) {
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
              has been created
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-wrap items-center gap-1">
          <VoterAvatar voter={itemData.actor} />
          <span className="text-[14px] leading-[20px] text-black">
            created an input for
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
    case 'itemProposalPass':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {renderOwnerDescriptor('input')}
          {itemChip && (
            <>
              <span className="text-[14px] leading-[20px] text-black">for</span>
              {itemChip}
            </>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectChip}
          <span className="text-[14px] leading-[20px] text-black">
            has passed!
          </span>
        </div>
      );
    case 'proposalSupported':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {actor ? (
            <>
              <VoterAvatar voter={actor} actorIsSelf={actorIsSelf} />
              {renderProposalSupportPhrase()}
            </>
          ) : (
            <>
              {renderOwnerDescriptor('proposal')}
              <span className="text-[14px] leading-[20px] text-black">
                has been supported
              </span>
              <span className="text-[14px] leading-[20px] text-black">for</span>
            </>
          )}
          {projectChip}
        </div>
      );
    case 'itemProposalPassed':
      return (
        <div className="flex flex-wrap items-center gap-1">
          {renderOwnerDescriptor('input')}
          {itemChip && (
            <>
              <span className="text-[14px] leading-[20px] text-black">for</span>
              {itemChip}
            </>
          )}
          <span className="text-[14px] leading-[20px] text-black opacity-50">
            in
          </span>
          {projectChip}
          <span className="text-[14px] leading-[20px] text-black">
            has been passed!
          </span>
        </div>
      );
    default:
      return (
        <span className="text-[14px] leading-[20px] text-black">{title}</span>
      );
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  itemData,
  onButtonClick,
  onSecondaryButtonClick,
  onNotificationClick,
}) => {
  const {
    type,
    timeAgo,
    buttonText,
    isRead = false,
    hasMultipleActions = false,
    secondaryButtonText,
    hideButton = false,
  } = itemData;

  const handlePrimaryAction = () => {
    onButtonClick?.(itemData);
  };

  const handleSecondaryAction = () => {
    onSecondaryButtonClick?.(itemData);
  };

  const handleNotificationClick = () => {
    onNotificationClick?.(itemData);
  };

  const bgColor = isRead
    ? 'bg-white'
    : 'bg-[rgba(104,198,172,0.1)] hover:bg-[rgba(104,198,172,0.15)]';
  const borderClass = 'border-b border-black/10';

  return (
    <div
      className={`flex flex-col gap-[30px] p-[14px] ${bgColor} ${borderClass} cursor-pointer`}
      onClick={handleNotificationClick}
    >
      <div className="flex w-full items-start gap-2.5">
        {/* Icon */}
        <div className="size-8 shrink-0">{getIconForType(type)}</div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2.5">
          {/* Text Content */}
          <div className="flex flex-col gap-2.5">
            <div className="flex w-full items-start justify-between gap-5">
              {formatNotificationText(itemData)}
            </div>
            {itemData.description &&
              type !== 'systemUpdate' &&
              type !== 'newItemsAvailable' && (
                <span className="text-[13px] leading-[18px] text-black/70">
                  {itemData.description}
                </span>
              )}

            {/* Time */}
            <span className="text-[12px] font-semibold leading-[12px] text-black opacity-50">
              {timeAgo}
            </span>

            {/* Action Buttons */}
            {!hideButton && buttonText && (
              <div
                className="flex gap-2.5"
                onClick={(e) => e.stopPropagation()}
              >
                {hasMultipleActions && secondaryButtonText ? (
                  <>
                    <Button
                      size="sm"
                      onPress={handlePrimaryAction}
                      className="h-[28px] bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
                    >
                      {buttonText}
                    </Button>
                    <Button
                      size="sm"
                      onPress={handleSecondaryAction}
                      className="h-[28px] bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
                    >
                      {secondaryButtonText}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onPress={handlePrimaryAction}
                    className="h-[28px] bg-[rgba(0,0,0,0.05)] text-black hover:bg-[rgba(0,0,0,0.15)]"
                  >
                    {buttonText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
