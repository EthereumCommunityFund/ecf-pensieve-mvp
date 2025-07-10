import React from 'react';

interface WarningCircleProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const WarningCircle: React.FC<WarningCircleProps> = ({
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
      <circle cx="16" cy="16" r="12" fill="#FF995D" fillOpacity="0.2" />
      <circle cx="16" cy="16" r="12" stroke="#FF995D" strokeWidth="2" />
      <line
        x1="16"
        y1="10"
        x2="16"
        y2="17"
        stroke="#FF995D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="21.5" r="1.5" fill="#FF995D" />
    </svg>
  );
};

export default WarningCircle;
