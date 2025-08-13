import React from 'react';

import { IconProps } from '@/types/common';

const RemoveChainIcon: React.FC<IconProps> = ({ size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill="#D75454" />
      <path
        d="M7 7L13 13M7 13L13 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default RemoveChainIcon;
