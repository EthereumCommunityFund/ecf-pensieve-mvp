import { IconProps } from '@/types/common';

const Trash = ({ size = 18, className = '', ...props }: IconProps) => {
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
      <path d="M2.25 1.13H15.75V14.76H2.25V1.13Z" fill="currentColor" />
    </svg>
  );
};

export default Trash;
