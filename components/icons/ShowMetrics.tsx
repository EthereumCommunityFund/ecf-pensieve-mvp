import React from 'react';

interface ShowMetricsIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const ShowMetricsIcon: React.FC<ShowMetricsIconProps> = ({
  size = 16,
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <g clipPath="url(#clip0_2882_3112)">
      <path
        d="M3 13V8.5H6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 13H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13V5.5H9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 13V2.5H13V13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2882_3112">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default ShowMetricsIcon;
