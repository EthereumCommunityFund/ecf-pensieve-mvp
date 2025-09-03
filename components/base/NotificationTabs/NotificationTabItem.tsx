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
      return 'bg-white rounded-none relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-black/60';
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
