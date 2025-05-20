import React from 'react';

import { IconProps } from '@/types/common';

const CaretDownIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <g opacity="0.5" clipPath="url(#clip0_866_9188)">
        <path
          d="M14.625 6.75L9 12.375L3.375 6.75"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_866_9188">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CaretDownIcon;
