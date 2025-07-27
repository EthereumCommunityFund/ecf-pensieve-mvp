import * as React from 'react';

const TagIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_3873_25126)">
        <path
          d="M3.96937 12.9694C3.82899 12.8288 3.75009 12.6383 3.75 12.4397V3.75H12.4397C12.6383 3.75009 12.8288 3.82899 12.9694 3.96937L22.2806 13.2806C22.4212 13.4213 22.5001 13.612 22.5001 13.8108C22.5001 14.0096 22.4212 14.2003 22.2806 14.3409L14.3437 22.2806C14.2031 22.4212 14.0124 22.5001 13.8136 22.5001C13.6148 22.5001 13.4241 22.4212 13.2834 22.2806L3.96937 12.9694Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.875 9C8.49632 9 9 8.49632 9 7.875C9 7.25368 8.49632 6.75 7.875 6.75C7.25368 6.75 6.75 7.25368 6.75 7.875C6.75 8.49632 7.25368 9 7.875 9Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_3873_25126">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TagIcon;
