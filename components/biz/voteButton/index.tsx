'use client';

import { Button, cn } from '@heroui/react';
import { useState } from 'react';

import { CaretUpIcon, XIcon } from '@/components/icons';
import { formatNumber } from '@/utils/formatters';

export interface VoteButtonProps {
  /**
   * Whether the user has voted
   */
  isVote?: boolean;
  /**
   * The number of votes
   */
  voteCount?: number;
  /**
   * The number of voters
   */
  voterCount?: number;
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  /**
   * Callback when the vote button is clicked
   */
  onVote?: () => void;
  /**
   * Additional class names
   */
  className?: string;
}

export function VoteButton({
  isVote = false,
  voteCount = 0,
  voterCount = 0,
  isLoading = false,
  onVote,
  className,
}: VoteButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Button styles based on isVote, hover and pressed states
  const getButtonStyles = () => {
    // 已投票状态 (isVote=true) - Interact-Active
    if (isVote) {
      return 'bg-[#64C0A5]'; // Green background for voted state
    }
    // 未投票状态 (isVote=false) - Default
    return 'bg-[rgba(0,0,0,0.05)]'; // Default light background (根据设计稿 Interact)
  };

  // Icon color based on isVote and pressed states
  const getIconColor = () => {
    // 已投票状态或按下状态下，图标为白色
    if (isVote) {
      return 'white'; // White icon for voted state or when pressed
    }
    return 'black'; // Black icon for default state
  };
  const getIcon = () => {
    if (isVote && isHovered) {
      return <XIcon size={20} color={getIconColor()} />;
    }
    return <CaretUpIcon size={20} color={getIconColor()} />;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        isIconOnly
        isLoading={isLoading}
        onPress={() => onVote && onVote()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'h-[40px] w-[40px] min-w-0 p-0',
          'flex items-center justify-center rounded-[8px]',
          'transition-colors duration-200',
          'border-none',
          getButtonStyles(),
          className,
        )}
      >
        {getIcon()}
      </Button>
      <p className="font-saria text-[13px] font-semibold leading-[20px] text-black opacity-60">
        {formatNumber(voteCount)}
      </p>
      <p className="font-saria text-[11px] font-semibold leading-[17px] text-[rgba(0,0,0,0.7)] opacity-60">
        {formatNumber(voterCount)}
      </p>
    </div>
  );
}
