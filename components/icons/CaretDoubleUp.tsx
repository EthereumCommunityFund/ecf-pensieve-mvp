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
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="6"
        y="15"
        width="20"
        height="10"
        fill="#68C6AC"
        fillOpacity="0.2"
      />
      <path
        d="M6 15L16 5L26 15"
        stroke="#68C6AC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 25L16 15L26 25"
        stroke="#68C6AC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CaretDoubleUp;
