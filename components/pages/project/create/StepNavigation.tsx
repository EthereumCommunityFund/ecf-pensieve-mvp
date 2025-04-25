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

import { CreateProjectStep, StepStatus } from './types';

interface StepNavigationProps {
  currentStep: CreateProjectStep;
  stepStatuses: Record<CreateProjectStep, StepStatus>;
  goToStep: (step: CreateProjectStep) => void;
}

export const getStepIcons = (step: CreateProjectStep, size = 32) => {
  const stepIcons: Record<CreateProjectStep, React.ReactNode> = {
    [CreateProjectStep.Basics]: <CardsIcon size={size} />,
    [CreateProjectStep.Dates]: <GaugeIcon size={size} />,
    [CreateProjectStep.Technicals]: <CodeIcon size={size} />,
    [CreateProjectStep.Organization]: <BuildingIcon size={size} />,
  };
  return stepIcons[step];
};

const stepLabels: Record<CreateProjectStep, string> = {
  [CreateProjectStep.Basics]: 'The Basics',
  [CreateProjectStep.Dates]: 'Dates & Statuses',
  [CreateProjectStep.Technicals]: 'Technicals',
  [CreateProjectStep.Organization]: 'Organization',
};

const stepsOrder: CreateProjectStep[] = [
  CreateProjectStep.Basics,
  CreateProjectStep.Dates,
  CreateProjectStep.Technicals,
  CreateProjectStep.Organization,
];

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  stepStatuses,
  goToStep,
}) => {
  return (
    <nav className="sticky top-[70px] w-[220px] shrink-0 flex-col gap-[20px] self-start mobile:hidden">
      <ul className="space-y-4">
        {stepsOrder.map((step, index) => {
          const status = stepStatuses[step];
          const isActive = step === currentStep;
          const isClickable = status === 'Finished' || isActive;

          return (
            <li key={step}>
              <Button
                color="secondary"
                onPress={() => isClickable && goToStep(step)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center justify-start border-none gap-[7px] w-full px-[10px] h-[44px] rounded-[5px] text-[16px] text-black font-[600]',
                  isActive ? 'bg-[rgba(0,0,0,0.1)] ' : 'bg-transparent',
                  status === 'Inactive'
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer',
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

export const StepHeader: React.FC<{ currentStep: CreateProjectStep }> = ({
  currentStep,
}) => {
  return (
    <>
      <div className="flex h-[50px] items-center justify-start border-b border-[rgba(0,0,0,0.1)] bg-[rgba(245,245,245,0.8)] px-[10px] backdrop-blur-[5px] mobile:hidden">
        {/* TODO fontFamily: Mona Sans */}
        <span className="text-[24px] font-[700] text-black opacity-80">
          {stepLabels[currentStep]}
        </span>
      </div>

      <div className="hidden h-[44px] items-center justify-start gap-[10px] border-b border-[rgba(0,0,0,0.2)] px-[14px] pb-[10px] pt-[6px] mobile:flex">
        {getStepIcons(currentStep, 24)}
        <span className="text-[16px] font-[600] leading-[26px] text-black">
          {stepLabels[currentStep]}
        </span>
      </div>
    </>
  );
};
