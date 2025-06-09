import React from 'react';

import { IconProps } from '@/types/common';

const FileIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_file_icon)">
        <path
          d="M15.023 5.78953L11.0855 1.85203C11.0332 1.79981 10.9711 1.7584 10.9029 1.73017C10.8346 1.70194 10.7614 1.68744 10.6875 1.6875H3.9375C3.63913 1.6875 3.35298 1.80603 3.142 2.017C2.93103 2.22798 2.8125 2.51413 2.8125 2.8125V15.1875C2.8125 15.4859 2.93103 15.772 3.142 15.983C3.35298 16.194 3.63913 16.3125 3.9375 16.3125H14.0625C14.3609 16.3125 14.647 16.194 14.858 15.983C15.069 15.772 15.1875 15.4859 15.1875 15.1875V6.1875C15.1876 6.11361 15.1731 6.04043 15.1448 5.97215C15.1166 5.90386 15.0752 5.84181 15.023 5.78953ZM10.6875 6.1875V3.09375L13.7812 6.1875H10.6875Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_file_icon">
          <rect width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FileIcon;
