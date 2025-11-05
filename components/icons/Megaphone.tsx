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
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_2918_1737)">
        <path
          opacity="0.2"
          d="M20 20H25C26.3261 20 27.5979 19.4732 28.5355 18.5355C29.4732 17.5979 30 16.3261 30 15C30 13.6739 29.4732 12.4021 28.5355 11.4645C27.5979 10.5268 26.3261 10 25 10H20V20Z"
          fill="currentColor"
        />
        <path
          d="M20 10V25.0837C20.0001 25.2482 20.0408 25.4101 20.1184 25.5551C20.196 25.7001 20.3082 25.8237 20.445 25.915L21.82 26.8312C21.9534 26.9202 22.1062 26.9757 22.2655 26.9932C22.4248 27.0107 22.5861 26.9897 22.7356 26.9319C22.8851 26.874 23.0185 26.7811 23.1245 26.6609C23.2306 26.5407 23.3062 26.3968 23.345 26.2412L25 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 25C5.00004 25.1904 5.05447 25.3769 5.15687 25.5375C5.25928 25.698 5.4054 25.826 5.57806 25.9064C5.75072 25.9867 5.94273 26.0161 6.13152 25.9911C6.32031 25.966 6.49802 25.8876 6.64375 25.765C13.1938 20.27 20 20 20 20H25C26.3261 20 27.5979 19.4732 28.5355 18.5355C29.4732 17.5978 30 16.3261 30 15C30 13.6739 29.4732 12.4021 28.5355 11.4644C27.5979 10.5268 26.3261 9.99998 25 9.99998H20C20 9.99998 13.1938 9.72998 6.64375 4.23623C6.4981 4.1137 6.3205 4.03529 6.13183 4.01019C5.94315 3.9851 5.75124 4.01438 5.57862 4.09458C5.40601 4.17478 5.25987 4.30258 5.15738 4.46296C5.05488 4.62334 5.00028 4.80965 5 4.99998V25Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2918_1737">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Megaphone;
