import React from 'react';

import { IconProps } from '@/types/common';

const PlusIcon: React.FC<IconProps> = ({ size = 32, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 17"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_708_15276)">
        <path
          d="M2.5 8.5H13.5"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 3V14"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_708_15276">
          <rect
            width={size}
            height={size}
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PlusIcon;
