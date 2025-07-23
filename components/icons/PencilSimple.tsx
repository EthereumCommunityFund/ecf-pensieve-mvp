import { IconProps } from '@/types/common';

const PencilSimple = ({ size = 18, className = '', ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M14.06 14.06L14.06 14.06" fill="currentColor" />
    </svg>
  );
};

export default PencilSimple;
