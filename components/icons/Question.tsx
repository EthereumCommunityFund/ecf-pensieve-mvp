import React from 'react';

import { IconProps } from '@/types/common';

const QuestionIcon: React.FC<IconProps> = ({ size = 18, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <g opacity="0.4" clipPath="url(#clip0_question)">
        <path
          d="M8.4375 12.09375C8.54076 12.09375 8.63973 12.1346 8.71694 12.2081C8.79415 12.2815 8.84375 12.3842 8.84375 12.5V13.125C8.84375 13.2408 8.89335 13.3435 8.97056 13.4169C9.04777 13.4904 9.14674 13.5312 9.25 13.5312"
          stroke="black"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.4375 7.34375C8.68103 7.34375 8.875 7.13978 8.875 6.89625C8.875 6.65272 8.68103 6.44875 8.4375 6.44875C8.19397 6.44875 8 6.65272 8 6.89625C8 7.13978 8.19397 7.34375 8.4375 7.34375Z"
          fill="black"
        />
        <path
          d="M9 15.75C12.1066 15.75 14.625 13.2316 14.625 10.125C14.625 7.01838 12.1066 4.5 9 4.5C5.89338 4.5 3.375 7.01838 3.375 10.125C3.375 13.2316 5.89338 15.75 9 15.75Z"
          stroke="black"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_question">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default QuestionIcon;
