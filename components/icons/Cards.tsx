import React from 'react';

import { IconProps } from '@/types/common';

const CardsIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <g clipPath="url(#clip0_616_5687)">
        <path
          d="M23 10H5C4.44772 10 4 10.4477 4 11V25C4 25.5523 4.44772 26 5 26H23C23.5523 26 24 25.5523 24 25V11C24 10.4477 23.5523 10 23 10Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 6H27C27.2652 6 27.5196 6.10536 27.7071 6.29289C27.8946 6.48043 28 6.73478 28 7V22"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_616_5687">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CardsIcon;
