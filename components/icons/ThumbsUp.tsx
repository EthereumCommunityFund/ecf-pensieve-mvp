import React from 'react';

interface ThumbsUpProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

const ThumbsUp: React.FC<ThumbsUpProps> = ({
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
        x="3"
        y="13"
        width="7"
        height="13"
        fill="#68C6AC"
        fillOpacity="0.2"
      />
      <path
        d="M3 13H10V26H3V13Z"
        stroke="#68C6AC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3L29 3C29 8 27 13 21 13H18L20 26H12L8 13H10V3Z"
        stroke="#68C6AC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ThumbsUp;
