import React from 'react';

interface LegoProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const Lego: React.FC<LegoProps> = ({ size = 32, className = '', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2918_1930)">
        <g opacity="0.2">
          <path d="M30 10V18L10 28V20L30 10Z" fill="black" />
        </g>
        <path
          d="M10 20V28"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 15C12.2091 15 14 13.8807 14 12.5C14 11.1193 12.2091 10 10 10C7.79086 10 6 11.1193 6 12.5C6 13.8807 7.79086 15 10 15Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 10C22.2091 10 24 8.88071 24 7.5C24 6.11929 22.2091 5 20 5C17.7909 5 16 6.11929 16 7.5C16 8.88071 17.7909 10 20 10Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 16L10 20L30 10L23.9037 6.95126"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5236 8.73749L12.6948 10.6525"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30 10V18L10 28L2 24V16L6.52375 13.7375"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2918_1930">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Lego;
