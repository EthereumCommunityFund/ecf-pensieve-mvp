import React from 'react';

import { IconProps } from '@/types/common';

const PlusSquareIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000000',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="3.75"
        y="3.75"
        width="16.5"
        height="16.5"
        stroke={color}
        strokeWidth="1.5"
        rx="2.25"
      />
      <line
        x1="8.25"
        y1="12"
        x2="15.75"
        y2="12"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="12"
        y1="8.25"
        x2="12"
        y2="15.75"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default PlusSquareIcon;
