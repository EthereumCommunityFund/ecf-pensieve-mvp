import React from 'react';

interface CaretDoubleDownProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const CaretDoubleDown: React.FC<CaretDoubleDownProps> = ({
  size = 32,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2918_1699)">
        <path opacity="0.2" d="M26 7L16 17L6 7H26Z" fill="#FF995D" />
        <path
          d="M26 17L16 27L6 17"
          stroke="#FF995D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 7L16 17L6 7H26Z"
          stroke="#FF995D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2918_1699">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CaretDoubleDown;
