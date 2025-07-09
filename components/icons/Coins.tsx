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
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <g clipPath="url(#clip0_2918_1653)">
        <path
          opacity="0.2"
          d="M22.0002 12.09V15.5C22.0002 17.75 18.3452 19.6063 13.5664 19.945C15.3052 20.6038 17.5502 21 20.0002 21C25.5227 21 30.0002 18.985 30.0002 16.5C30.0002 14.3225 26.5652 12.5075 22.0002 12.09Z"
          fill="#68C6AC"
        />
        <path
          opacity="0.2"
          d="M12 15C17.5228 15 22 12.9853 22 10.5C22 8.01472 17.5228 6 12 6C6.47715 6 2 8.01472 2 10.5C2 12.9853 6.47715 15 12 15Z"
          fill="#68C6AC"
        />
        <path
          d="M12 15C17.5228 15 22 12.9853 22 10.5C22 8.01472 17.5228 6 12 6C6.47715 6 2 8.01472 2 10.5C2 12.9853 6.47715 15 12 15Z"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 10.5V15.5C2 17.985 6.4775 20 12 20C17.5225 20 22 17.985 22 15.5V10.5"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 14.625V19.625"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.0002 12.09C26.5652 12.5075 30.0002 14.3225 30.0002 16.5C30.0002 18.985 25.5227 21 20.0002 21C17.5502 21 15.3052 20.6038 13.5664 19.945"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 19.91V21.5C10 23.985 14.4775 26 20 26C25.5225 26 30 23.985 30 21.5V16.5"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 20.625V25.625"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 14.625V25.625"
          stroke="#68C6AC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2918_1653">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Coins;
