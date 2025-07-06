import React from 'react';

interface MegaphoneProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const Megaphone: React.FC<MegaphoneProps> = ({
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
        x="20"
        y="10"
        width="10"
        height="10"
        fill="#000000"
        fillOpacity="0.2"
      />
      <path
        d="M20 10V27H25V10"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 4L30 26V4L5 4Z"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Megaphone;
