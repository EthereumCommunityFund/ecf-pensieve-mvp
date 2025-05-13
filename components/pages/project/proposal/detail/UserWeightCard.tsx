import { FC } from 'react';

interface IProps {
  weight?: string | number;
}

const UserWeightCard: FC<IProps> = ({ weight = '00' }) => {
  return (
    <div className="mobile:p-[20px] flex w-full items-center justify-between rounded-[10px] border border-black/10 bg-white p-[14px]">
      <div className="flex items-center justify-start gap-[10px]">
        <p className="font-mona text-[18px] font-[600] leading-[25px] text-black ">
          Your Weight
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="21"
          viewBox="0 0 20 21"
          fill="none"
        >
          <g opacity="0.5">
            <path
              d="M9.375 9.875C9.54076 9.875 9.69973 9.94085 9.81694 10.0581C9.93415 10.1753 10 10.3342 10 10.5V13.625C10 13.7908 10.0658 13.9497 10.1831 14.0669C10.3003 14.1842 10.4592 14.25 10.625 14.25"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.6875 7.84375C10.119 7.84375 10.4688 7.49397 10.4688 7.0625C10.4688 6.63103 10.119 6.28125 9.6875 6.28125C9.25603 6.28125 8.90625 6.63103 8.90625 7.0625C8.90625 7.49397 9.25603 7.84375 9.6875 7.84375Z"
              fill="black"
            />
            <path
              d="M10 18C14.1421 18 17.5 14.6421 17.5 10.5C17.5 6.35786 14.1421 3 10 3C5.85786 3 2.5 6.35786 2.5 10.5C2.5 14.6421 5.85786 18 10 18Z"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      <div className="font-mona text-[18px] font-[600] leading-[25px] text-black ">
        {weight}
      </div>
    </div>
  );
};

export default UserWeightCard;
