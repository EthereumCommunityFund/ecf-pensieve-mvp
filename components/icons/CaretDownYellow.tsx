import React from 'react';

import { IconProps } from '@/types/common';

const CaretDownIcon: React.FC<IconProps> = ({ size = 24, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
    >
      <g clipPath="url(#clip0_1743_3155)">
        <path
          d="M13 6.5L8 11.5L3 6.5"
          stroke="#C47D54"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1743_3155">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(16 16.5) rotate(180)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CaretDownIcon;
