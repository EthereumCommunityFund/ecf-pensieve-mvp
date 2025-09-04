import { FC } from 'react';

import { Button } from '@/components/base';

interface ICollapseButtonProps {
  isExpanded: boolean;
  onChange: () => void;
}
const CollapseButton: FC<ICollapseButtonProps> = ({ isExpanded, onChange }) => {
  return (
    <Button
      color="secondary"
      size="sm"
      className="gap-[5px] bg-black/5 px-[10px] py-[5px]"
      onPress={onChange}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
      >
        <g clipPath="url(#clip0_847_1236)">
          <path
            d="M5 11.5L8 14.5L11 11.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 5.5L8 2.5L11 5.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_847_1236">
            <rect
              width="16"
              height="16"
              fill="white"
              transform="translate(0 0.5)"
            />
          </clipPath>
        </defs>
      </svg>
      {isExpanded ? 'Collapse Items' : 'Expand Items'}
    </Button>
  );
};

interface IMetricButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}
const MetricButton: FC<IMetricButtonProps> = ({
  onClick,
  isVisible = false,
}) => {
  return (
    <Button
      color="secondary"
      size="sm"
      className="gap-[5px] bg-black/5 px-[10px] py-[5px] text-black"
      onPress={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
      >
        <g clipPath="url(#clip0_847_1242)">
          <path
            d="M3 13.5V9H6"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 13.5H2"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 13.5V6H9.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 13.5V3H13V13.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_847_1242">
            <rect
              width="16"
              height="16"
              fill="white"
              transform="translate(0 0.5)"
            />
          </clipPath>
        </defs>
      </svg>
      {isVisible ? 'Hide Metrics' : 'Show Metrics'}
    </Button>
  );
};

interface IFilterButtonProps {
  onClick: () => void;
}

const FilterButton: FC<IFilterButtonProps> = ({ onClick }) => {
  return (
    <Button
      color="secondary"
      size="sm"
      className="w-auto gap-[5px] bg-black/5 px-[10px] py-[5px]"
      isIconOnly={true}
      onPress={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
      >
        <g clipPath="url(#clip0_847_1250)">
          <path
            d="M4 9H12"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.5 6H14.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 12H9.5"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_847_1250">
            <rect
              width="16"
              height="16"
              fill="white"
              transform="translate(0 0.5)"
            />
          </clipPath>
        </defs>
      </svg>
    </Button>
  );
};

export { CollapseButton, FilterButton, MetricButton };
