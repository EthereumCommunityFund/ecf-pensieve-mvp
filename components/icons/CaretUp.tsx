import React from 'react';

import { IconProps } from '@/types/common';

const CaretUpIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'black',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill={color}
      {...props}
    >
      <path
        d="M3.375 5.625L9 11.25L14.625 5.625"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(180 9 8.4375)"
      />
    </svg>
  );
};

export default CaretUpIcon;
