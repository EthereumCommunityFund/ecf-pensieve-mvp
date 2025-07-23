import { IconProps } from '@/types/common';

const DotsThreeVertical = ({
  size = 32,
  className = '',
  ...props
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="16" cy="7.5" r="1.125" fill="currentColor" />
      <circle cx="16" cy="16" r="1.125" fill="currentColor" />
      <circle cx="16" cy="24.5" r="1.125" fill="currentColor" />
    </svg>
  );
};

export default DotsThreeVertical;
