'use client';

import { cn } from '@heroui/react';
import { FC, memo, useMemo } from 'react';

import { Button } from '@/components/base/button';
import { useUserWeightModal } from '@/components/biz/modal/userWeightCard/Context';
import { InfoIcon, PlusIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IPocItemKey } from '@/types/item';
import { formatWeight } from '@/utils/weight';

import { useProjectDetailContext } from '../../context/projectDetailContext';

import NewItemRewardCard from './NewItemRewardCard';

interface RightContentProps {
  onSubmitEntry?: () => void;
  hideSubmitEntry?: boolean;
  showRewardCard?: boolean;
}

const RightContent: FC<RightContentProps> = memo(
  ({ onSubmitEntry, hideSubmitEntry, showRewardCard }) => {
    const { profile } = useAuth();
    const { openUserWeightModal, setUserWeight } = useUserWeightModal();
    const { displayProposalDataOfKey, currentItemKey } =
      useProjectDetailContext();

    const userWeight = useMemo(() => {
      if (!profile) return 0;
      return Number(profile.weight);
    }, [profile]);

    const displayedItemWeight = useMemo(() => {
      const itemKey = currentItemKey as IPocItemKey;
      const itemConfigWeight = Number(AllItemConfig[itemKey]?.weight);
      if (displayProposalDataOfKey) {
        const itemTopWeight = Number(displayProposalDataOfKey.itemTopWeight);
        if (itemTopWeight > 0) {
          return itemTopWeight;
        }
      }
      return itemConfigWeight;
    }, [displayProposalDataOfKey, currentItemKey]);

    const isUserWeightExceedsItemWeight = useMemo(() => {
      return userWeight > displayedItemWeight;
    }, [userWeight, displayedItemWeight]);

    // Handle InfoIcon click event
    // Set current user's weight value
    // Open user weight explanation modal
    const handleInfoIconClick = () => {
      if (profile?.weight !== undefined) {
        setUserWeight(Number(profile.weight));
      }
      // 打开用户权重说明模态框
      openUserWeightModal();
    };

    return (
      <div className="tablet:pt-0 mobile:pt-0 flex flex-col gap-2.5 p-5">
        {/* Your Weight Section */}
        <div className="tablet:hidden mobile:hidden flex flex-col gap-3.5 rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-3.5">
          {/* Header with title and info icon */}
          <div className="flex flex-col gap-[5px] border-b border-dashed border-[rgba(0,0,0,0.1)] pb-2.5">
            <div className="flex items-center gap-[5px]">
              <span className="font-mona text-[15px] font-semibold leading-[1.41] tracking-[1.39%] text-black">
                Your Contribution Points
              </span>
              <Button isIconOnly size="sm" onPress={handleInfoIconClick}>
                <InfoIcon size={20} />
              </Button>
            </div>
            <span className="font-mona text-[18px] font-semibold leading-[1.41] tracking-[1.39%] text-black">
              {formatWeight(userWeight)}
            </span>
          </div>

          {/* Weight Information */}
          <div className="flex flex-col gap-[5px]">
            <span className="font-mona text-[13px] font-semibold leading-[1.41] text-black opacity-80">
              Current Item Weight: {displayedItemWeight}
            </span>
            {isUserWeightExceedsItemWeight && (
              <span className="font-sans text-[13px] leading-[20px] text-black/80">
                Your CP exceeds the item's threshold, allowing you to surpass
                the weight of any submission you vote on.
              </span>
            )}
          </div>
        </div>

        {!hideSubmitEntry && (
          <>
            {/* Contribute Section */}
            <div className="tablet:p-0 mobile:p-0 flex flex-col gap-3.5 rounded-[10px] p-2.5">
              {/* Content */}
              <div className="tablet:hidden mobile:hidden flex flex-col gap-[5px]">
                <span className="font-mona text-[14px] font-semibold leading-[1.41] tracking-[1.79%] text-black">
                  Contribute
                </span>
                <span className="font-sans text-[14px] leading-[1.43] text-black opacity-80">
                  You can vote or participate in submissions.
                </span>
              </div>

              {/* Submit Entry Button */}
              <Button
                className={cn(
                  'flex items-center justify-center gap-2.5 rounded-[5px] border border-[rgba(0,0,0,0.1)]',
                  'bg-[#F0F0F0] px-[30px] py-2.5',
                  'hover:bg-[rgba(0,0,0,0.1)] transition-colors duration-200',
                  'h-auto min-w-0',
                )}
                onPress={onSubmitEntry}
              >
                <PlusIcon size={16} />
                <span className="font-sans text-[14px] font-semibold leading-[1.36] text-black">
                  Submit an Entry
                </span>
              </Button>
            </div>
          </>
        )}

        {/* Reward Card */}
        {showRewardCard && <NewItemRewardCard />}
      </div>
    );
  },
);

RightContent.displayName = 'RightContent';

export default RightContent;
