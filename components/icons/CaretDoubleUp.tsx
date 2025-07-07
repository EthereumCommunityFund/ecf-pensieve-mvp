import React from 'react';

interface CaretDoubleUpProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const CaretDoubleUp: React.FC<CaretDoubleUpProps> = ({
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
      <g clipPath="url(#clip0_2918_1691)">
        <path opacity="0.2" d="M6 25L16 15L26 25H6Z" fill="#68C6AC" />
        <path
          d="M6 25L16 15L26 25H6Z"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 15L16 5L26 15"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2918_1691">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CaretDoubleUp;
