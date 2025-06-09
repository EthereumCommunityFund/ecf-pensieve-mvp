import React from 'react';

import { IconProps } from '@/types/common';

const WarningDiamondIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2172_15968)">
        <path
          d="M16.5 17V10"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 22.75C17.1904 22.75 17.75 22.1904 17.75 21.5C17.75 20.8096 17.1904 20.25 16.5 20.25C15.8096 20.25 15.25 20.8096 15.25 21.5C15.25 22.1904 15.8096 22.75 16.5 22.75Z"
          fill="black"
        />
        <path
          d="M15.7964 3.29152L3.79058 15.2973C3.40249 15.6854 3.40249 16.3146 3.79058 16.7027L15.7964 28.7085C16.1845 29.0966 16.8137 29.0966 17.2017 28.7085L29.2075 16.7027C29.5956 16.3146 29.5956 15.6854 29.2075 15.2973L17.2017 3.29152C16.8137 2.90344 16.1845 2.90344 15.7964 3.29152Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2172_15968">
          <rect
            width="32"
            height="32"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default WarningDiamondIcon;
