import React from 'react';

import { IconProps } from '@/types/common';

const CheckSelectIcon: React.FC<IconProps> = ({
  size = 17,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  return (
    <svg
      aria-hidden="true"
      data-selected="true"
      role="presentation"
      width={size}
      height={size}
      viewBox="0 0 17 18"
      fill="none"
      className={className}
      {...props}
    >
      <polyline
        fill="none"
        points="1 9 7 14 15 4"
        stroke={color}
        strokeDasharray="22"
        strokeDashoffset="44"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        style={{ transition: 'stroke-dashoffset 200ms' }}
      />
    </svg>
  );
};

export default CheckSelectIcon;
