import React from 'react';

import { IconProps } from '@/types/common';

const ListsIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath="url(#clip0_lists)">
        <path
          d="M15.75 21L10.5 17.25L5.25 21V6.75C5.25 6.55109 5.32902 6.36032 5.46967 6.21967C5.61032 6.07902 5.80109 6 6 6H15C15.1989 6 15.3897 6.07902 15.5303 6.21967C15.671 6.36032 15.75 6.55109 15.75 6.75V21Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.25 6V3.75C8.25 3.55109 8.32902 3.36032 8.46967 3.21967C8.61032 3.07902 8.80109 3 9 3H18C18.1989 3 18.3897 3.07902 18.5303 3.21967C18.671 3.36032 18.75 3.55109 18.75 3.75V18L15.75 15.8578"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_lists">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ListsIcon;
