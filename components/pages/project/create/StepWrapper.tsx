'use client';

import { cn } from '@heroui/react';
import React from 'react';

import { IItemCategoryEnum } from '@/types/item';

interface StepWrapperProps {
  stepId: IItemCategoryEnum;
  currentStep: IItemCategoryEnum;
  children: React.ReactNode;
  className?: string;
}

const StepWrapper: React.FC<StepWrapperProps> = ({
  stepId,
  currentStep,
  children,
  className,
}) => {
  const isVisible = stepId === currentStep;

  return (
    <div
      id={`step-${stepId}`}
      role="tabpanel" // ARIA role for tab panel
      aria-labelledby={`step-tab-${stepId}`} // Should correspond to tab button id
      hidden={!isVisible}
      className={cn(
        'w-full transition-opacity duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default StepWrapper;
