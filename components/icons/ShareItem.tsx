import React from 'react';

import { IconProps } from '@/types/common';

const ShareItemIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      {...props}
    >
      <g
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        clipPath="url(#a)"
      >
        <path d="m13.75 11.875 3.75-3.75-3.75-3.75M15 16.875H2.5v-10" />
        <path d="M5.625 13.75a7.5 7.5 0 0 1 7.266-5.625H17.5" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ShareItemIcon;
