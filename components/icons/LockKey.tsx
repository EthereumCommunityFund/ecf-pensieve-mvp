import { IconProps } from '@/types/common';

const LockKey = ({ size = 20, className = '', ...props }: IconProps) => {
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
      <path
        d="M4.06 8.94H17.94V21.94H4.06V8.94Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.94 1.63V8.94H13.06V1.63C13.06 0.97 12.56 0.47 11.9 0.47H10.1C9.44 0.47 8.94 0.97 8.94 1.63Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="11"
        cy="15.25"
        r="2.03"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M13 16.25V18.69"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LockKey;
