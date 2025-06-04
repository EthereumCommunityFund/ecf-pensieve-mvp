import React from 'react';

import { IconProps } from '@/types/common';

const CheckIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <g clipPath="url(#clip0_626_13336)">
        <path
          d="M3.125 11.25L7.5 15.625L17.5 5.625"
          stroke="#64C0A5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_626_13336">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CheckIcon;
