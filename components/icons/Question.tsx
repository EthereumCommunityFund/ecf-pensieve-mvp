import React from 'react';

import { IconProps } from '@/types/common';

const QuestionIcon: React.FC<IconProps> = ({ size = 18, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <g opacity="0.4" clipPath="url(#clip0_4506_9910)">
        <path
          d="M9 13.2188C9.31066 13.2188 9.5625 12.9669 9.5625 12.6562C9.5625 12.3456 9.31066 12.0938 9 12.0938C8.68934 12.0938 8.4375 12.3456 8.4375 12.6562C8.4375 12.9669 8.68934 13.2188 9 13.2188Z"
          fill="black"
        />
        <path
          d="M9 10.125V9.5625C10.2424 9.5625 11.25 8.68078 11.25 7.59375C11.25 6.50672 10.2424 5.625 9 5.625C7.75758 5.625 6.75 6.50672 6.75 7.59375V7.875"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4506_9910">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default QuestionIcon;
