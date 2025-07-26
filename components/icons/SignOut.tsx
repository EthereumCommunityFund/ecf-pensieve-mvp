import React from 'react';

import { IconProps } from '@/types/common';

const SignOutIcon: React.FC<IconProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4.5 3.75C4.5 3.75 4.5 3.75 4.5 3.75V20.25C4.5 20.25 4.5 20.25 4.5 20.25H10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 12H21L17.25 8.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.25 15.75L21 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SignOutIcon;
