import React from 'react';

import { IconProps } from '@/types/common';

const ArrowUpRightIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_795_995)">
        <path
          d="M4.5 13.5L13.5 4.5"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.1875 4.5H13.5V11.8125"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_795_995">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ArrowUpRightIcon;
