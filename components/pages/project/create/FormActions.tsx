'use client';

import { cn } from '@heroui/react';
import React from 'react';

import { Button } from '@/components/base';

import { CreateProjectStep } from './types';

interface FormActionsProps {
  currentStep: CreateProjectStep;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onDiscard: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  currentStep,
  isSubmitting,
  onBack,
  onNext,
  onDiscard,
}) => {
  const isFirstStep = currentStep === CreateProjectStep.Basics;
  const isLastStep = currentStep === CreateProjectStep.Organization;

  const baseButtonClassnames = 'px-[30px] h-[40px]';

  const onDiscardButtonPress = () => {
    if (isFirstStep) {
      onDiscard();
    } else {
      onBack();
    }
  };

  return (
    <div className="mt-[20px] flex justify-end gap-[10px] pr-[10px]">
      <Button
        color="secondary"
        size="md"
        className={cn(baseButtonClassnames)}
        onPress={onDiscardButtonPress}
        isDisabled={isSubmitting}
      >
        {isFirstStep ? 'Discard' : 'Back'}
      </Button>
      <Button
        color="primary"
        size="md"
        className={cn(baseButtonClassnames)}
        onPress={onNext}
        isDisabled={isSubmitting}
        isLoading={isSubmitting && isLastStep}
      >
        {isLastStep ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
      </Button>
    </div>
  );
};

export default FormActions;
