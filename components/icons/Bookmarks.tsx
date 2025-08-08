import React from 'react';

import { IconProps } from '@/types/common';

const BookmarksIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M8 4H24C24.5523 4 25 4.44772 25 5V27L16 22L7 27V5C7 4.44772 7.44772 4 8 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default BookmarksIcon;
