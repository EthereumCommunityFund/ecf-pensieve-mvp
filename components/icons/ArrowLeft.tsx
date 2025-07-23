import { IconProps } from '@/types/common';

const ArrowLeft = ({ size = 20, className = '', ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M2.66 3.92L17.35 16.11" fill="currentColor" />
    </svg>
  );
};

export default ArrowLeft;
