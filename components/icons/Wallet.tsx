import React from 'react';

import { IconProps } from '@/types/common';

const WalletIcon: React.FC<IconProps> = ({ size = 20 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={`0 0 20 20`}
      width={size}
      height={size}
    >
      <path
        d="M1.5 4.24973C2.12675 3.77896 2.9058 3.5 3.75 3.5H17.25C18.0942 3.5 18.8733 3.77896 19.5 4.24973C19.4999 3.00721 18.4926 2 17.25 2H3.75C2.50745 2 1.50015 3.00721 1.5 4.24973Z"
        fill="currentColor"
      />
      <path
        d="M1.5 7.24973C2.12675 6.77896 2.9058 6.5 3.75 6.5H17.25C18.0942 6.5 18.8733 6.77896 19.5 7.24973C19.4999 6.00721 18.4926 5 17.25 5H3.75C2.50745 5 1.50015 6.00721 1.5 7.24973Z"
        fill="currentColor"
      />
      <path
        d="M7.5 8C8.05228 8 8.5 8.44772 8.5 9C8.5 10.1046 9.39543 11 10.5 11C11.6046 11 12.5 10.1046 12.5 9C12.5 8.44772 12.9477 8 13.5 8H17.25C18.4926 8 19.5 9.00736 19.5 10.25V15.75C19.5 16.9926 18.4926 18 17.25 18H3.75C2.50736 18 1.5 16.9926 1.5 15.75V10.25C1.5 9.00736 2.50736 8 3.75 8H7.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default WalletIcon;
