'use client';

import { cn } from '@heroui/react';
import React from 'react';

import { Button } from '@/components/base/button';
import {
  BuildingIcon,
  CardsIcon,
  CheckIcon,
  CodeIcon,
  GaugeIcon,
} from '@/components/icons';
import { IItemCategoryEnum } from '@/types/item';

import { IStepStatus } from './types';

interface StepNavigationProps {
  currentStep: IItemCategoryEnum;
  stepStatuses: Record<IItemCategoryEnum, IStepStatus>;
  goToStep: (step: IItemCategoryEnum) => void;
}

export const getStepIcons = (step: IItemCategoryEnum, size = 32) => {
  const stepIcons: Record<IItemCategoryEnum, React.ReactNode> = {
    [IItemCategoryEnum.Basics]: <CardsIcon size={size} />,
    [IItemCategoryEnum.Technicals]: <CodeIcon size={size} />,
    [IItemCategoryEnum.Organization]: <BuildingIcon size={size} />,
    [IItemCategoryEnum.Financial]: <GaugeIcon size={size} />,
  };
  return stepIcons[step];
};

const stepLabels: Record<IItemCategoryEnum, string> = {
  [IItemCategoryEnum.Basics]: 'The Basics',
  [IItemCategoryEnum.Technicals]: 'Technicals',
  [IItemCategoryEnum.Organization]: 'Organization',
  [IItemCategoryEnum.Financial]: 'Financial',
};

const stepsOrder: IItemCategoryEnum[] = [
  IItemCategoryEnum.Basics,
  IItemCategoryEnum.Technicals,
  IItemCategoryEnum.Organization,
  IItemCategoryEnum.Financial,
];

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  stepStatuses,
  goToStep,
}) => {
  const currentStepIndex = stepsOrder.indexOf(currentStep);

  return (
    <nav className="mobile:hidden sticky top-[70px] w-[220px] shrink-0 flex-col gap-[20px] self-start">
      <ul className="space-y-4">
        {stepsOrder.map((step, index) => {
          const status = stepStatuses[step];
          const isActive = step === currentStep;
          const isClickable =
            status === 'Finished' || isActive || index <= currentStepIndex;

          return (
            <li key={step}>
              <Button
                color="secondary"
                onPress={() => isClickable && goToStep(step)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center justify-start border-none gap-[7px] w-full px-[10px] h-[44px] rounded-[5px] text-[16px] text-black font-[600]',
                  isActive ? 'bg-[rgba(0,0,0,0.1)] ' : 'bg-transparent',
                  !isClickable ? 'cursor-not-allowed' : 'cursor-pointer',
                )}
              >
                <div
                  className={cn(
                    'flex-1 flex items-center justify-start gap-[10px]',
                    isActive ? 'opacity-100' : 'opacity-50',
                  )}
                >
                  {getStepIcons(step, 32)}
                  <span className="flex-1 text-left">{stepLabels[step]}</span>
                </div>
                {status === 'Finished' && <CheckIcon size={20} />}
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default StepNavigation;

export const StepHeader: React.FC<{ currentStep: IItemCategoryEnum }> = ({
  currentStep,
}) => {
  return (
    <>
      <div className="mobile:hidden flex h-[50px] items-center justify-start border-b border-[rgba(0,0,0,0.1)] bg-[rgba(245,245,245,0.8)] px-[10px] backdrop-blur-[5px]">
        {/* TODO fontFamily: Mona Sans */}
        <span className="text-[24px] font-[700] text-black opacity-80">
          {stepLabels[currentStep]}
        </span>
      </div>

      <div className="mobile:flex hidden h-[44px] items-center justify-start gap-[10px] border-b border-[rgba(0,0,0,0.2)] px-[14px] pb-[10px] pt-[6px]">
        {getStepIcons(currentStep, 24)}
        <span className="text-[16px] font-[600] leading-[26px] text-black">
          {stepLabels[currentStep]}
        </span>
      </div>
    </>
  );
};
