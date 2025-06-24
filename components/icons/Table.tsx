import React from 'react';

import { IconProps } from '@/types/common';

const TableIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'black',
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      {...props}
    >
      {/* Table outline */}
      <rect
        x="2.5"
        y="4.375"
        width="15"
        height="11.25"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Horizontal line 1 */}
      <line
        x1="2.5"
        y1="8.125"
        x2="17.5"
        y2="8.125"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Horizontal line 2 */}
      <line
        x1="2.5"
        y1="11.875"
        x2="17.5"
        y2="11.875"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Vertical line */}
      <line
        x1="6.875"
        y1="8.125"
        x2="6.875"
        y2="15.625"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default TableIcon;
