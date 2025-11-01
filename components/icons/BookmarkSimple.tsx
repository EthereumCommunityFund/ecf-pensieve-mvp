import React from 'react';

import { IconProps } from '@/types/common';

interface BookmarkSimpleProps extends IconProps {
  weight?: 'regular' | 'fill';
}

const BookmarkSimple: React.FC<BookmarkSimpleProps> = ({
  weight = 'regular',
  size = 24,
  className = '',
  ...props
}) => {
  if (weight === 'fill') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 14 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M12.1603 0H1.52004C1.1169 0 0.730272 0.160146 0.445209 0.445209C0.160146 0.730272 0 1.1169 0 1.52004V18.2405C6.74872e-05 18.3761 0.0364312 18.5093 0.105318 18.6261C0.174204 18.7429 0.273103 18.8392 0.391752 18.9049C0.510401 18.9707 0.644476 19.0034 0.780064 18.9999C0.915652 18.9963 1.04781 18.9565 1.16283 18.8846L6.84018 15.3362L12.5185 18.8846C12.6335 18.9562 12.7655 18.9958 12.901 18.9993C13.0364 19.0027 13.1703 18.9699 13.2888 18.9042C13.4073 18.8385 13.5061 18.7423 13.575 18.6256C13.6438 18.5089 13.6802 18.376 13.6804 18.2405V1.52004C13.6804 1.1169 13.5202 0.730272 13.2351 0.445209C12.9501 0.160146 12.5635 0 12.1603 0Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M13 18.25L7 14.5L1 18.25V1.75C1 1.55109 1.07902 1.36032 1.21967 1.21967C1.36032 1.07902 1.55109 1 1.75 1H12.25C12.4489 1 12.6397 1.07902 12.7803 1.21967C12.921 1.36032 13 1.55109 13 1.75V18.25Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BookmarkSimple;
