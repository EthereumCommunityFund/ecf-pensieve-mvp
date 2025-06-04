import React from 'react';

import { IconProps } from '@/types/common';

const CheckedGreenIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_782_1598)">
        <path
          d="M3.625 11.25L8 15.625L18 5.625"
          stroke="#64C0A5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_782_1598">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CheckedGreenIcon;
