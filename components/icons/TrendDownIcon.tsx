import React from 'react';

import { IconProps } from '@/types/common';

const TrendDownIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2722_839)">
        <path
          d="M14.5 12.5L8.5 6.5L6 9L1.5 4.5"
          stroke="#C47D54"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 8.5V12.5H10.5"
          stroke="#C47D54"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2722_839">
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

export default TrendDownIcon;
