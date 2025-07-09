'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { NotificationTabItemProps } from './types';

const NotificationTabItem: FC<NotificationTabItemProps> = ({
  tab,
  isActive,
  onClick,
  className,
}) => {
  const getTabStyles = () => {
    if (isActive) {
      return 'bg-white border-0 border-b-[3px] border-black/60 rounded-none';
    }
    return 'rounded-[5px]';
  };

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClick(event);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'cursor-pointer flex items-center justify-center gap-[10px] px-[20px] py-[10px] h-[42px]',
        'transition-colors duration-200',
        getTabStyles(),
        className,
      )}
    >
      <span className="text-[14px] font-[600] leading-[19px] text-black">
        {tab.label}
      </span>
      {tab.count !== undefined && (
        <span className="text-[14px] font-[600] leading-[19px] text-black opacity-30">
          {tab.count}
        </span>
      )}
    </div>
  );
};

export default NotificationTabItem;
