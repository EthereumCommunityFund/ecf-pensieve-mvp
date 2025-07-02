import { Button, cn, Tooltip } from '@heroui/react';
import { FC } from 'react';

import { PushPinSimpleIcon, PushPinSimpleSlashIcon } from '@/components/icons';
import { IItemSubCategoryEnum } from '@/types/item';

interface ITooltipThWithPinProps {
  title: string;
  tooltipContext: string;
  columnId?: string;
  category?: IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

const TooltipThWithPin: FC<ITooltipThWithPinProps> = ({
  title,
  tooltipContext,
  columnId,
  category,
  isPinned = false,
  onTogglePin,
}) => {
  const handlePinToggle = () => {
    if (onTogglePin && columnId && category) {
      // If already pinned, unpin it; otherwise pin to appropriate side based on column type
      if (isPinned) {
        onTogglePin(category, columnId, undefined);
      } else {
        // Actions and Support columns should pin to right, others to left
        const defaultPosition =
          columnId === 'actions' || columnId === 'support' ? 'right' : 'left';
        onTogglePin(category, columnId, defaultPosition);
      }
    }
  };

  // Show pin functionality only if onTogglePin is provided and required props are available
  const showPinFeature = onTogglePin && columnId && category;

  return (
    <div
      className={cn(
        'flex items-center gap-[5px]',
        showPinFeature ? 'w-full justify-between' : 'justify-start',
      )}
    >
      <div className="flex items-center gap-[5px]">
        <div>{title}</div>
        <Tooltip
          content={tooltipContext}
          classNames={{
            content: 'p-[10px] rounded-[5px] border border-black/10',
          }}
          closeDelay={0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <g opacity="0.4" clipPath="url(#clip0_857_1579)">
              <path
                d="M9 13.2188C9.31066 13.2188 9.5625 12.9669 9.5625 12.6562C9.5625 12.3456 9.31066 12.0938 9 12.0938C8.68934 12.0938 8.4375 12.3456 8.4375 12.6562C8.4375 12.9669 8.68934 13.2188 9 13.2188Z"
                fill="black"
              />
              <path
                d="M9 10.125V9.5625C10.2424 9.5625 11.25 8.68078 11.25 7.59375C11.25 6.50672 10.2424 5.625 9 5.625C7.75758 5.625 6.75 6.50672 6.75 7.59375V7.875"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_857_1579">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </Tooltip>
      </div>

      {showPinFeature && (
        <Tooltip
          content={isPinned ? `Unpin ${title} column` : `Pin ${title} column`}
          classNames={{
            content: 'p-[10px] rounded-[5px] border border-black/10',
          }}
          closeDelay={0}
        >
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className={cn(
              'h-[18px] min-w-[18px] p-0 transition-colors hover:bg-black/5',
              isPinned ? '' : 'opacity-20',
            )}
            onPress={handlePinToggle}
          >
            {isPinned ? (
              <PushPinSimpleSlashIcon size={18} color="currentColor" />
            ) : (
              <PushPinSimpleIcon size={18} color="currentColor" />
            )}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default TooltipThWithPin;
export { TooltipThWithPin };

// Export as TooltipTh for backward compatibility and simple tooltip usage
export { TooltipThWithPin as TooltipTh };
