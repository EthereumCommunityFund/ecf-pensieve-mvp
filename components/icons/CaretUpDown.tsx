import React from 'react';

import { IconProps } from '@/types/common';

const CaretUpDownIcon: React.FC<IconProps> = ({ size = 16, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M5 11L8 14L11 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 2L8 5L11 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(180 8 3.5)"
      />
    </svg>
  );
};

export default CaretUpDownIcon;
