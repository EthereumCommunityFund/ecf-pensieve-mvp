import React from 'react';

import { IconProps } from '@/types/common';

const PaperClipIcon: React.FC<IconProps> = ({ size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 19"
      fill="none"
    >
      <g clipPath="url(#clip0_704_15130)">
        <path
          d="M11.2501 6.12501L5.39236 12.0798C5.18652 12.2918 5.07238 12.5763 5.0746 12.8719C5.07683 13.1674 5.19524 13.4501 5.40425 13.6591C5.61326 13.868 5.89609 13.9863 6.1916 13.9884C6.48711 13.9905 6.77158 13.8762 6.98353 13.6702L13.9663 6.59118C14.3883 6.16918 14.6254 5.59682 14.6254 5.00001C14.6254 4.40321 14.3883 3.83085 13.9663 3.40884C13.5443 2.98684 12.9719 2.74976 12.3751 2.74976C11.7783 2.74976 11.2059 2.98684 10.7839 3.40884L3.80119 10.4886C3.17677 11.1233 2.82843 11.979 2.83206 12.8693C2.83568 13.7597 3.19098 14.6125 3.82055 15.2421C4.45011 15.8716 5.30295 16.2269 6.19329 16.2305C7.08363 16.2342 7.93933 15.8858 8.574 15.2614L14.3438 9.50001"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_704_15130">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PaperClipIcon;
