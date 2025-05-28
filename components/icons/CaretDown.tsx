import React from 'react';

import { IconProps } from '@/types/common';

const CaretDownIcon: React.FC<IconProps> = ({ size = 24, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <g opacity="0.3">
        <path
          d="M14.625 6.75L9 12.375L3.375 6.75"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default CaretDownIcon;
