import React from 'react';

import { IconProps } from '@/types/common';

const GaugeIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <g clipPath="url(#clip0_616_5694)">
        <path
          d="M3 22.0001V19.1413C3 11.9563 8.76875 6.02508 15.9537 6.00008C17.6648 5.99399 19.3603 6.32576 20.9428 6.97634C22.5254 7.62693 23.964 8.58354 25.1761 9.7913C26.3881 10.9991 27.3498 12.4342 28.006 14.0145C28.6622 15.5947 29 17.289 29 19.0001V22.0001C29 22.2653 28.8946 22.5197 28.7071 22.7072C28.5196 22.8947 28.2652 23.0001 28 23.0001H4C3.73478 23.0001 3.48043 22.8947 3.29289 22.7072C3.10536 22.5197 3 22.2653 3 22.0001Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 6V10"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 23L21 12"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 17H28.8475"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.17371 17H6.99996"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_616_5694">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default GaugeIcon;
