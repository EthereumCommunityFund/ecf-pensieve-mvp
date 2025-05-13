import { cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base';

interface IProps {
  isExpanded: boolean;
  isFiltered: boolean;
  onChangeExpand: () => void;
  onChangeFilter: () => void;
}

const ActionSectionHeader: FC<IProps> = ({
  isExpanded,
  isFiltered,
  onChangeExpand,
  onChangeFilter,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-black/10 py-[8px]">
      <span className="font-mona text-[24px] font-[700] leading-[34px] text-black/80">
        Items
      </span>
      <div className="flex items-center justify-end gap-[10px]">
        <Button
          isIconOnly
          color={isExpanded ? 'primary' : 'secondary'}
          className={cn('p-[5px] transition-colors duration-300')}
          size="sm"
          onPress={onChangeExpand}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className={cn(
              'transition-colors duration-300',
              isExpanded ? 'stroke-white' : 'stroke-black',
            )}
          >
            <g clipPath="url(#clip0_868_9484)">
              <path
                d="M12.5 6.25H15V8.75"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 13.75H5V11.25"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.875 3.75H3.125C2.77982 3.75 2.5 4.02982 2.5 4.375V15.625C2.5 15.9702 2.77982 16.25 3.125 16.25H16.875C17.2202 16.25 17.5 15.9702 17.5 15.625V4.375C17.5 4.02982 17.2202 3.75 16.875 3.75Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_868_9484">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </Button>
        <Button
          isIconOnly
          color={isFiltered ? 'primary' : 'secondary'}
          className={cn('p-[5px] transition-colors duration-300')}
          size="sm"
          onPress={onChangeFilter}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className={cn(
              'transition-colors duration-300',
              isFiltered ? 'stroke-white' : 'stroke-black',
            )}
          >
            <g clipPath="url(#clip0_868_9490)">
              <path
                d="M5 10.625H15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1.875 6.875H18.125"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.125 14.375H11.875"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_868_9490">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </Button>
      </div>
    </div>
  );
};
export default ActionSectionHeader;
