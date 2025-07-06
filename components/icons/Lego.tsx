import React from 'react';

interface LegoProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const Lego: React.FC<LegoProps> = ({ size = 32, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="12.69"
        y="8.74"
        width="3.83"
        height="1.91"
        fill="#000000"
        fillOpacity="0.2"
      />
      <rect
        x="2"
        y="13.74"
        width="4.52"
        height="2.26"
        fill="#000000"
        fillOpacity="0.2"
      />
      <g fillOpacity="0.2">
        <rect x="10" y="10" width="20" height="18" fill="#000000" />
      </g>
      <line x1="10" y1="20" x2="10" y2="28" stroke="#000000" strokeWidth="2" />
      <rect
        x="6"
        y="10"
        width="8"
        height="5"
        stroke="#000000"
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="16"
        y="5"
        width="8"
        height="5"
        stroke="#000000"
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="2"
        y="6.95"
        width="28"
        height="13.05"
        stroke="#000000"
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="2"
        y="10"
        width="28"
        height="18"
        stroke="#000000"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default Lego;
