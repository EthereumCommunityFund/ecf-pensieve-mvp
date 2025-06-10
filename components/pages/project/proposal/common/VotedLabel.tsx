const VotedLabel = () => {
  return (
    <div className="flex items-center gap-[5px] text-[14px] font-[700] leading-[20px] text-[#40A486]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <g clipPath="url(#clip0_860_7270)">
          <path
            d="M6.875 10.625L8.75 12.5L13.125 8.125"
            stroke="#40A486"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
            stroke="#40A486"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_860_7270">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <span>You voted in this proposal</span>
    </div>
  );
};

export default VotedLabel;
