import React from 'react';

import { IconProps } from '@/types/common';

const ClockClockwiseIcon: React.FC<IconProps> = ({ size = 20 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <g clipPath="url(#clip0_1765_3631)">
        <path
          opacity="0.2"
          d="M9 15.1875C12.4173 15.1875 15.1875 12.4173 15.1875 9C15.1875 5.58274 12.4173 2.8125 9 2.8125C5.58274 2.8125 2.8125 5.58274 2.8125 9C2.8125 12.4173 5.58274 15.1875 9 15.1875Z"
          fill="#F7992D"
        />
        <path
          d="M9 5.625V9L11.8125 10.6875"
          stroke="#F7992D"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.9375 7.3125H15.75V4.5"
          stroke="#F7992D"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.247 13.4998C12.3625 14.3344 11.2516 14.8899 10.0532 15.0968C8.85483 15.3037 7.62203 15.1529 6.50887 14.6632C5.3957 14.1735 4.45153 13.3666 3.79432 12.3433C3.13711 11.3201 2.79601 10.1258 2.81364 8.90982C2.83127 7.69382 3.20684 6.50998 3.89344 5.50621C4.58003 4.50244 5.5472 3.72325 6.67409 3.26601C7.80099 2.80877 9.03764 2.69374 10.2295 2.93531C11.4214 3.17687 12.5157 3.76432 13.3757 4.62424C14.2032 5.46236 14.8867 6.25267 15.7501 7.31228"
          stroke="#F7992D"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1765_3631">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ClockClockwiseIcon;
