import React from 'react';

import { IconProps } from '@/types/common';

const CoinVerticalIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2881_1348)">
        <path
          d="M7.3125 15.75C9.48712 15.75 11.25 12.7279 11.25 9C11.25 5.27208 9.48712 2.25 7.3125 2.25C5.13788 2.25 3.375 5.27208 3.375 9C3.375 12.7279 5.13788 15.75 7.3125 15.75Z"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.3125 2.25H10.6875C12.8623 2.25 14.625 5.27344 14.625 9C14.625 12.7266 12.8623 15.75 10.6875 15.75H7.3125"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2473 4.5H13.6223"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.25 9H14.625"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2473 13.5H13.6223"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2881_1348">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CoinVerticalIcon;
