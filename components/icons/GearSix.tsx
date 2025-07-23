import { IconProps } from '@/types/common';

const GearSix = ({ size = 20, className = '', ...props }: IconProps) => {
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
      <path d="M1.25 1.87L17.5 18.12" fill="currentColor" />
    </svg>
  );
};

export default GearSix;
