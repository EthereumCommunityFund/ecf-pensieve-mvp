import React from 'react';

import { IconProps } from '@/types/common';

const ShieldStarIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_3296_6000)">
        <path
          d="M12 9.5V13.25"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.25 11.75L12 13.25"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.75 16.25L12 13.25"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.25 16.25L12 13.25"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.75 11.75L12 13.25"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.25 11V5.75C20.25 5.55109 20.171 5.36032 20.0303 5.21967C19.8897 5.07902 19.6989 5 19.5 5H4.5C4.30109 5 4.11032 5.07902 3.96967 5.21967C3.82902 5.36032 3.75 5.55109 3.75 5.75V11C3.75 20 12 22.25 12 22.25C12 22.25 20.25 20 20.25 11Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3296_6000">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ShieldStarIcon;
