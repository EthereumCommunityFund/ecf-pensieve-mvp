import React from 'react';

import { IconProps } from '@/types/common';

const InfoIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <g opacity="0.5" clipPath="url(#clip0_585_2197)">
        <path
          d="M9.375 9.375C9.54076 9.375 9.69973 9.44085 9.81694 9.55806C9.93415 9.67527 10 9.83424 10 10V13.125C10 13.2908 10.0658 13.4497 10.1831 13.5669C10.3003 13.6842 10.4592 13.75 10.625 13.75"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.6875 7.34375C10.119 7.34375 10.4688 6.99397 10.4688 6.5625C10.4688 6.13103 10.119 5.78125 9.6875 5.78125C9.25603 5.78125 8.90625 6.13103 8.90625 6.5625C8.90625 6.99397 9.25603 7.34375 9.6875 7.34375Z"
          fill="black"
        />
        <path
          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_585_2197">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default InfoIcon;
