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
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2918_1794)">
        <path
          opacity="0.2"
          d="M4 13H10V26H4C3.73478 26 3.48043 25.8946 3.29289 25.7071C3.10536 25.5196 3 25.2652 3 25V14C3 13.7348 3.10536 13.4804 3.29289 13.2929C3.48043 13.1054 3.73478 13 4 13Z"
          fill="#68C6AC"
        />
        <path
          d="M4 13H10V26H4C3.73478 26 3.48043 25.8946 3.29289 25.7071C3.10536 25.5196 3 25.2652 3 25V14C3 13.7348 3.10536 13.4804 3.29289 13.2929C3.48043 13.1054 3.73478 13 4 13Z"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 13L15 3C16.0609 3 17.0783 3.42143 17.8284 4.17157C18.5786 4.92172 19 5.93913 19 7V10H27C27.2837 10.0001 27.5641 10.0605 27.8227 10.1773C28.0813 10.2941 28.312 10.4645 28.4996 10.6773C28.6872 10.8901 28.8274 11.1404 28.9109 11.4116C28.9944 11.6827 29.0192 11.9685 28.9837 12.25L27.4837 24.25C27.4229 24.7332 27.1878 25.1776 26.8225 25.4998C26.4573 25.822 25.987 25.9999 25.5 26H10"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2918_1794">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ThumbsUp;
