const ActiveLeadingLabel = () => {
  return (
    <div className="flex shrink-0 items-center gap-[5px] rounded-[5px] border border-[rgba(104,204,174,0.40)] bg-[rgba(104,204,174,0.10)] px-[8px] py-[4px] text-[14px] font-[400] leading-[20px] text-[#40A486]">
      <span>Leading Proposal</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M8.4375 8.4375C8.58668 8.4375 8.72976 8.49676 8.83525 8.60225C8.94074 8.70774 9 8.85082 9 9V11.8125C9 11.9617 9.05926 12.1048 9.16475 12.2102C9.27024 12.3157 9.41332 12.375 9.5625 12.375"
          stroke="#40A486"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.71875 6.60938C9.10708 6.60938 9.42188 6.29458 9.42188 5.90625C9.42188 5.51792 9.10708 5.20312 8.71875 5.20312C8.33042 5.20312 8.01562 5.51792 8.01562 5.90625C8.01562 6.29458 8.33042 6.60938 8.71875 6.60938Z"
          fill="#40A486"
        />
        <path
          d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
          stroke="#40A486"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const InactiveLeadingLabel = () => {
  return (
    <div className="flex shrink-0 items-center gap-[5px] rounded-[5px] border border-black/10 bg-white px-[8px] py-[4px] text-[14px] font-[400] leading-[20px] text-black/90">
      <span>Leading Proposal</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <g opacity="0.34">
          <path
            d="M9.375 9.375C9.54076 9.375 9.69973 9.44085 9.81694 9.55806C9.93415 9.67527 10 9.83424 10 10V13.125C10 13.2908 10.0658 13.4497 10.1831 13.5669C10.3003 13.6842 10.4592 13.75 10.625 13.75"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.6875 7.34375C10.119 7.34375 10.4688 6.99397 10.4688 6.5625C10.4688 6.13103 10.119 5.78125 9.6875 5.78125C9.25603 5.78125 8.90625 6.13103 8.90625 6.5625C8.90625 6.99397 9.25603 7.34375 9.6875 7.34375Z"
            fill="black"
          />
          <path
            d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

export { ActiveLeadingLabel, InactiveLeadingLabel };
