import { IconProps } from '@/types/common';

const DotsThreeVertical = ({
  size = 32,
  className = '',
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <g clipPath="url(#clip0_3281_3069)">
        <path
          d="M16 17.5C16.8284 17.5 17.5 16.8284 17.5 16C17.5 15.1716 16.8284 14.5 16 14.5C15.1716 14.5 14.5 15.1716 14.5 16C14.5 16.8284 15.1716 17.5 16 17.5Z"
          fill="black"
        />
        <path
          d="M16 9C16.8284 9 17.5 8.32843 17.5 7.5C17.5 6.67157 16.8284 6 16 6C15.1716 6 14.5 6.67157 14.5 7.5C14.5 8.32843 15.1716 9 16 9Z"
          fill="black"
        />
        <path
          d="M16 26C16.8284 26 17.5 25.3284 17.5 24.5C17.5 23.6716 16.8284 23 16 23C15.1716 23 14.5 23.6716 14.5 24.5C14.5 25.3284 15.1716 26 16 26Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_3281_3069">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DotsThreeVertical;
