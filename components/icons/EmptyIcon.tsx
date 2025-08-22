import React from 'react';

interface EmptyIconProps {
  className?: string;
}

const EmptyIcon: React.FC<EmptyIconProps> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  );
};

export default EmptyIcon;
