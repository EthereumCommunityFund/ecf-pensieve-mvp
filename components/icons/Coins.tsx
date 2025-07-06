import React from 'react';

interface CoinsProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const Coins: React.FC<CoinsProps> = ({
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
      <ellipse
        cx="22"
        cy="16.5"
        rx="8"
        ry="4.5"
        fill="#68C6AC"
        fillOpacity="0.2"
      />
      <ellipse
        cx="11"
        cy="12"
        rx="9"
        ry="4.5"
        fill="#68C6AC"
        fillOpacity="0.2"
      />
      <ellipse
        cx="11"
        cy="12"
        rx="9"
        ry="4.5"
        stroke="#68C6AC"
        strokeWidth="2"
      />
      <line
        x1="11"
        y1="16.5"
        x2="11"
        y2="21.5"
        stroke="#68C6AC"
        strokeWidth="2"
      />
      <line x1="8" y1="19" x2="8" y2="24" stroke="#68C6AC" strokeWidth="2" />
      <ellipse
        cx="22"
        cy="16.5"
        rx="8"
        ry="4.5"
        stroke="#68C6AC"
        strokeWidth="2"
      />
      <line x1="30" y1="21" x2="30" y2="26" stroke="#68C6AC" strokeWidth="2" />
      <line x1="24" y1="20" x2="24" y2="31" stroke="#68C6AC" strokeWidth="2" />
      <line x1="16" y1="19" x2="16" y2="25" stroke="#68C6AC" strokeWidth="2" />
    </svg>
  );
};

export default Coins;
