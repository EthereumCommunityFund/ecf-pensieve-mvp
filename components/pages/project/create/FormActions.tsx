'use client';

import { cn } from '@heroui/react';
import React from 'react';

import ECFButton from '@/components/base/button';

import { CreateProjectStep } from './types';

interface FormActionsProps {
  currentStep: CreateProjectStep;
  isSubmitting: boolean;
  isStepValid: boolean;
  onBack: () => void;
  onNext: () => void;
  onDiscard: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  currentStep,
  isSubmitting,
  isStepValid,
  onBack,
  onNext,
  onDiscard,
}) => {
  const isFirstStep = currentStep === CreateProjectStep.Basics;
  const isLastStep = currentStep === CreateProjectStep.Organization;

  const baseButtonClassnames = 'rounded-[5px] px-[30px] h-[40px] text-[14px]';

  const onDiscardButtonPress = () => {
    if (isFirstStep) {
      onDiscard();
    } else {
      onBack();
    }
  };

  return (
    <div className="mt-[20px] flex justify-end gap-[10px] pr-[10px]">
      <ECFButton
        className={cn(
          baseButtonClassnames,
          'bg-transparent border border-black/10 text-black',
        )}
        onPress={onDiscardButtonPress}
        isDisabled={isSubmitting}
      >
        {isFirstStep ? 'Discard' : 'Back'}
      </ECFButton>
      <ECFButton
        className={cn(
          baseButtonClassnames,
          'bg-black text-white hover:bg-black/90 hover:text-white',
        )}
        onPress={onNext}
        isDisabled={!isStepValid || isSubmitting}
        isLoading={isSubmitting && isLastStep}
      >
        {isLastStep ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
      </ECFButton>
    </div>
  );
};

export default FormActions;
