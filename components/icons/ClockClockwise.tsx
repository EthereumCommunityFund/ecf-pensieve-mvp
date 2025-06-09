import React from 'react';

import { IconProps } from '@/types/common';

const ClockClockwiseIcon: React.FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      // height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath="url(#clip0_1763_3246)">
        <path
          opacity="0.2"
          d="M12 20.25C16.5563 20.25 20.25 16.5563 20.25 12C20.25 7.44365 16.5563 3.75 12 3.75C7.44365 3.75 3.75 7.44365 3.75 12C3.75 16.5563 7.44365 20.25 12 20.25Z"
          fill="#F7992D"
        />
        <path
          d="M12 7.5V12L15.75 14.25"
          stroke="#F7992D"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.25 9.75H21V6"
          stroke="#F7992D"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.6625 17.9999C16.4832 19.1127 15.002 19.8533 13.4042 20.1292C11.8063 20.4051 10.1626 20.204 8.67836 19.5511C7.19413 18.8981 5.93523 17.8222 5.05896 16.4579C4.18268 15.0936 3.72788 13.5013 3.75139 11.8799C3.77489 10.2586 4.27566 8.68013 5.19112 7.34177C6.10658 6.00341 7.39613 4.9645 8.89866 4.35485C10.4012 3.74519 12.0501 3.59182 13.6393 3.91391C15.2284 4.23599 16.6875 5.01925 17.8341 6.16581C18.9375 7.28331 19.8488 8.33706 21 9.74987"
          stroke="#F7992D"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1763_3246">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ClockClockwiseIcon;
