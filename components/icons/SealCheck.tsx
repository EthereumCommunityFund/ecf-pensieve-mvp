import React from 'react';

interface SealCheckProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const SealCheck: React.FC<SealCheckProps> = ({
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
      <circle cx="16" cy="16" r="13" fill="#68C6AC" fillOpacity="0.2" />
      <circle cx="16" cy="16" r="13" stroke="#68C6AC" strokeWidth="2" />
      <path
        d="M11 16L15 20L21 13"
        stroke="#68C6AC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SealCheck;
