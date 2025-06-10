import React from 'react';

import { IconProps } from '@/types/common';

const CaretUpIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'black',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
    >
      <g clipPath="url(#clip0_1743_3160)">
        <path
          d="M3 10.5L8 5.5L13 10.5"
          stroke="#408671"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1743_3160">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CaretUpIcon;
