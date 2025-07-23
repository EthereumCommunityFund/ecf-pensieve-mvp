import { IconProps } from '@/types/common';

const GlobeHemisphereWest = ({
  size = 20,
  className = '',
  ...props
}: IconProps) => {
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
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.71 3.47C9.26 3.52 10.81 4.16 12.26 5.39"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.62 5.41C7.69 6.63 9.76 8.85 11.83 12.07"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.38 13.81C14.65 15.74 17.92 17.67 21.19 19.60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default GlobeHemisphereWest;
