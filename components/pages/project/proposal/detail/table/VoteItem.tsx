import { CircularProgress, cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base';
import { IProject, IProposal } from '@/types';

import { ITableProposalItem } from '../ProposalDetails';

interface IProps {
  project: IProject;
  proposal: IProposal;
  proposalItem: ITableProposalItem;
  isVoted: boolean;
  isLoading: boolean;
  onAction: () => Promise<void>;
}

const VoteItem: FC<IProps> = ({
  project,
  proposal,
  proposalItem,
  onAction,
  isVoted,
  isLoading,
}) => {
  // TODO isValidated value
  const value = Math.floor(Math.random() * 11);
  const isValidated = value === 10;

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center justify-start gap-[10px]">
        <CircularProgress
          aria-label="Loading..."
          color="warning"
          showValueLabel={true}
          size="sm"
          minValue={0}
          maxValue={10}
          value={value}
          strokeWidth={3}
          formatOptions={{
            style: 'decimal',
          }}
          classNames={{
            base: '',
            label: '',
            value: 'text-[14px] font-[600] font-mona',
            svg: 'size-[36px] rotate-[180deg]',
            track: 'stroke-[#D9D9D9]',
            indicator: 'stroke-[#64C0A5]',
          }}
        />

        <div className="flex items-center justify-start gap-[5px] opacity-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g clipPath="url(#clip0_780_1444)">
              <path
                d="M12.8492 15.2835C12.9107 15.3778 12.9456 15.487 12.9502 15.5995C12.9548 15.712 12.9289 15.8236 12.8753 15.9226C12.8217 16.0216 12.7423 16.1043 12.6456 16.1619C12.5489 16.2195 12.4384 16.2499 12.3258 16.2499H0.79924C0.686659 16.2499 0.576171 16.2195 0.479451 16.1619C0.382731 16.1043 0.303369 16.0216 0.249751 15.9226C0.196133 15.8236 0.17025 15.712 0.174835 15.5995C0.179421 15.487 0.214305 15.3778 0.275803 15.2835C1.15557 13.9293 2.44962 12.8959 3.96487 12.3374C3.12721 11.7798 2.49125 10.9674 2.15104 10.0203C1.81082 9.07325 1.78441 8.04185 2.07572 7.07862C2.36702 6.1154 2.96057 5.27149 3.76859 4.67169C4.57662 4.07189 5.55621 3.74805 6.56252 3.74805C7.56883 3.74805 8.54843 4.07189 9.35645 4.67169C10.1645 5.27149 10.758 6.1154 11.0493 7.07862C11.3406 8.04185 11.3142 9.07325 10.974 10.0203C10.6338 10.9674 9.99784 11.7798 9.16018 12.3374C10.6754 12.8959 11.9695 13.9293 12.8492 15.2835ZM19.7172 15.2718C18.8372 13.9233 17.546 12.8943 16.0352 12.3374C17.0241 11.6713 17.722 10.6534 17.9868 9.49084C18.2516 8.3283 18.0635 7.10853 17.4607 6.07981C16.8578 5.0511 15.8857 4.29076 14.742 3.95357C13.5984 3.61637 12.3692 3.72766 11.3047 4.26479C11.264 4.28581 11.2284 4.31552 11.2005 4.35182C11.1725 4.38811 11.1529 4.43011 11.143 4.47483C11.1331 4.51956 11.1331 4.56592 11.1431 4.61062C11.1531 4.65533 11.1728 4.69729 11.2008 4.73354C11.9923 5.72089 12.4469 6.93576 12.498 8.20019C12.549 9.46463 12.1938 10.7122 11.4844 11.7601C11.4385 11.8286 11.4216 11.9124 11.4373 11.9933C11.4529 12.0742 11.4999 12.1457 11.568 12.1921C12.4929 12.8377 13.2847 13.6555 13.9 14.6007C14.1482 14.9808 14.2495 15.4381 14.1852 15.8874C14.1779 15.9321 14.1805 15.9779 14.1927 16.0215C14.2048 16.0651 14.2263 16.1055 14.2557 16.14C14.285 16.1745 14.3215 16.2022 14.3626 16.2212C14.4038 16.2401 14.4485 16.25 14.4938 16.2499H19.2047C19.3423 16.25 19.4761 16.2046 19.5853 16.1208C19.6945 16.0371 19.773 15.9196 19.8086 15.7867C19.8303 15.6992 19.8334 15.6082 19.8177 15.5195C19.8019 15.4308 19.7677 15.3464 19.7172 15.2718Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_780_1444">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="font-mona text-[14px] font-[600] leading-[19px] text-black">
            2/3
          </span>
        </div>
      </div>

      <Button
        color="secondary"
        size="sm"
        isIconOnly
        disabled={isLoading}
        onPress={onAction}
        className={cn(
          'px-[5px] border-none',
          isValidated
            ? 'hover:bg-transparent cursor-default'
            : isVoted
              ? ''
              : 'opacity-30',
        )}
      >
        {isVoted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
          >
            <g clipPath="url(#clip0_782_1598)">
              <path
                d="M3.625 11.25L8 15.625L18 5.625"
                stroke="#64C0A5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_782_1598">
                <rect
                  width="20"
                  height="20"
                  fill="white"
                  transform="translate(0.5)"
                />
              </clipPath>
            </defs>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
          >
            <g clipPath="url(#clip0_780_1331)">
              <path
                d="M17.1922 12.0573L10.9422 5.80733C10.8841 5.74922 10.8152 5.70312 10.7393 5.67167C10.6635 5.64021 10.5821 5.62402 10.5 5.62402C10.4179 5.62402 10.3365 5.64021 10.2607 5.67167C10.1848 5.70312 10.1159 5.74922 10.0578 5.80733L3.80782 12.0573C3.72031 12.1447 3.6607 12.2561 3.63655 12.3774C3.61239 12.4988 3.62477 12.6245 3.67211 12.7388C3.71946 12.853 3.79964 12.9507 3.90252 13.0193C4.00539 13.088 4.12632 13.1246 4.25 13.1245H16.75C16.8737 13.1246 16.9946 13.088 17.0975 13.0193C17.2004 12.9507 17.2805 12.853 17.3279 12.7388C17.3752 12.6245 17.3876 12.4988 17.3635 12.3774C17.3393 12.2561 17.2797 12.1447 17.1922 12.0573Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_780_1331">
                <rect
                  width="20"
                  height="20"
                  fill="white"
                  transform="translate(0.5)"
                />
              </clipPath>
            </defs>
          </svg>
        )}
      </Button>
    </div>
  );
};

export default VoteItem;
