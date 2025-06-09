import React from 'react';

import { IconProps } from '@/types/common';

const ShareIcon: React.FC<IconProps> = ({ size = 20, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <g opacity="0.3" clipPath="url(#clip0_1019_5639)">
        <path
          d="M13.75 11.875L17.5 8.125L13.75 4.375"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 16.875H2.5V6.875"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.625 13.75C6.04084 12.1395 6.98028 10.7128 8.29554 9.69457C9.61081 8.6763 11.2273 8.12416 12.8906 8.125H17.5"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1019_5639">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ShareIcon;
