import { cn } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FC, useMemo } from 'react';

import { Button } from '@/components/base';

import { IFormTypeEnum } from './types';

interface SuccessDisplayProps {
  formType: IFormTypeEnum;
  entityId: number;
  projectId?: number;
}

const SuccessDisplay: FC<SuccessDisplayProps> = ({
  formType,
  entityId,
  projectId,
}) => {
  const router = useRouter();
  const isProject = formType === IFormTypeEnum.Project;
  const itemType = isProject ? 'project' : 'proposal';
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

  const handleBackToContribute = () => {
    router.replace(backButtonLink);
  };

  const handleViewEntity = () => {
    router.replace(viewButtonLink);
  };

  return (
    <div
      className={cn(
        ' flex flex-col gap-[20px]',
        isProject ? 'pc:mx-[200px]' : '',
      )}
    >
      {/* <StepHeader
        currentStep={IItemCategoryEnum.Financial}
        showSuccessPage={true}
      /> */}

      <h1 className="text-[24px] font-[700] text-red-500">
        UI & Animation not done
      </h1>

      <div className="">
        <div className="mb-8 space-y-4 text-left sm:mb-10">
          <div className="flex items-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 size-6 shrink-0 sm:mr-3 sm:size-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-base sm:text-lg">
              Your {itemType} is posted in the Contribute Page
            </span>
          </div>
          <div className="flex items-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 size-6 shrink-0 sm:mr-3 sm:size-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-base sm:text-lg">
              Your User Weight and vote is being accounted for all items
            </span>
          </div>
        </div>

        <p className="mb-8 text-base text-gray-600 sm:mb-10 sm:text-lg">
          This {itemType} will now proceed with community verification. Once
          verified, this will be published as a project page.
        </p>

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
    </div>
  );
};

export default SuccessDisplay;
