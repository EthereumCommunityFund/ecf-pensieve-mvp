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
        y="7"
        width="20"
        height="10"
        fill="#FF995D"
        fillOpacity="0.2"
      />
      <path
        d="M6 17L16 27L26 17"
        stroke="#FF995D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 7L16 17L26 7"
        stroke="#FF995D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CaretDoubleDown;
