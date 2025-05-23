import { cn } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useMemo } from 'react';

import { Button } from '@/components/base';
import CheckedCircleIcon from '@/components/icons/CheckCircle';
import { ESSENTIAL_ITEM_WEIGHT_SUM, REWARD_PERCENT } from '@/lib/constants';

import { IFormTypeEnum } from './types';

interface SuccessDisplayProps {
  formType: IFormTypeEnum;
  entityId: number;
  projectId?: number;
}

const RewardWeight = ESSENTIAL_ITEM_WEIGHT_SUM * REWARD_PERCENT;

const SuccessDisplay: FC<SuccessDisplayProps> = ({
  formType,
  entityId,
  projectId,
}) => {
  const router = useRouter();
  const isProject = formType === IFormTypeEnum.Project;
  const viewButtonText = isProject ? 'View Your Project' : 'View Your Proposal';

  const viewButtonLink = useMemo(() => {
    return isProject
      ? `/project/pending/${entityId}`
      : `/project/pending/${projectId!}/proposal/${entityId}`;
  }, [isProject, entityId, projectId]);

  const backButtonLink = useMemo(() => {
    return isProject
      ? '/project/create'
      : `/project/pending/${projectId!}/proposal/create`;
  }, [isProject, projectId]);

  const handleBackToContribute = useCallback(() => {
    location.reload();
  }, []);

  const handleViewEntity = useCallback(() => {
    router.replace(viewButtonLink);
  }, [viewButtonLink, router]);

  return (
    <div
      className={cn(
        ' flex flex-col gap-[20px] mobile:mx-[10px]',
        isProject ? '' : '',
      )}
    >
      {/* Header */}
      <div className="flex items-center border-b border-black/10 bg-[rgba(245,245,245,0.8)] px-[10px] py-[8px] backdrop-blur-[5px]">
        <span className="font-mona text-[24px] font-[700] leading-[34px] text-black/80">
          Submitting Proposal
        </span>
      </div>

      {/* Content */}
      {isProject ? (
        <div className="font-mona flex flex-col gap-[20px] text-[18px] font-[500] leading-[1.6] text-black">
          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span className="">
              Your User Weight and vote is being accounted for all items
            </span>
          </div>
          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span className="">
              Your proposal is posted in the Contribute Page
            </span>
          </div>

          <div className="flex items-start gap-[5px]">
            <CheckedCircleIcon />
            <div className="flex flex-col gap-[5px]">
              <p>
                <span className="font-open-sans mr-[5px] font-[800] italic text-[#64C0A5]">
                  ZERO-TO-ONE
                </span>
                <span>reward has been added to your User Weight</span>
              </p>
              <p className="text-[14px] font-[400] leading-[20px] text-black/80">
                You have gained{' '}
                <span className="font-[700]">{RewardWeight}</span> to your User
                Weight
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="font-mona flex flex-col gap-[20px] text-[18px] font-[500] leading-[1.6] text-black">
          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span>Your proposal is posted in the Contribute Page</span>
          </div>

          <div className="flex items-center gap-[5px]">
            <CheckedCircleIcon />
            <span>
              Your User Weight and vote is being accounted for all items
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="text-[16px]  leading-[1.6] text-black">
        This proposal will now{' '}
        <span className="font-[600] text-black/80">
          proceed with community verification
        </span>
        . Once verified, this will be published as a project page.
      </div>

      {/* Actions */}
      <div className="mobile:flex-col flex justify-end gap-[10px]">
        <Button
          color="secondary"
          onClick={handleBackToContribute}
          type="button"
          className="px-[20px]"
        >
          Back to Contribute
        </Button>
        <Button
          color="primary"
          onClick={handleViewEntity}
          type="button"
          className="px-[30px]"
        >
          {viewButtonText}
        </Button>
      </div>
    </div>
  );
};

export default SuccessDisplay;
