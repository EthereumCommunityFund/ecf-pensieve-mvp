import type { FC, SVGProps } from 'react';

const CircleXIcon: FC<SVGProps<SVGSVGElement>> = ({
  width = 18,
  height = 18,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 18 18"
    fill="none"
    {...props}
  >
    <g opacity="0.4" clipPath="url(#clip0_4150_4830)">
      <path
        d="M11.25 6.75L6.75 11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 6.75L11.25 11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4150_4830">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default CircleXIcon;
