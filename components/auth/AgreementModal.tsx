'use client';

import { X } from '@phosphor-icons/react';
import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@heroui/react';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@/components/base';
import { AgreementModalProps, AgreementStep } from '@/types/agreement';

import {
  AboutECFPensieveContent,
  DisclaimerContent,
  PrivacyPolicyContent,
} from './AgreementContents';
import ScrollDetector from './ScrollDetector';

const AGREEMENT_STEPS: AgreementStep[] = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy (For Alpha)',
    content: <PrivacyPolicyContent />,
    requireScrollToEnd: true,
  },
  {
    id: 'about-ecf',
    title: 'About ECF Pensieve',
    content: <AboutECFPensieveContent />,
    requireScrollToEnd: true,
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    content: <DisclaimerContent />,
    requireScrollToEnd: true,
  },
];

const AgreementModal: React.FC<AgreementModalProps> = ({
  isOpen,
  onComplete,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [agreedSteps, setAgreedSteps] = useState<Set<string>>(new Set());

  const currentStep = AGREEMENT_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === AGREEMENT_STEPS.length - 1;
  const canProceed = !currentStep.requireScrollToEnd || hasScrolledToEnd;

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setHasScrolledToEnd(false);
      setAgreedSteps(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    setHasScrolledToEnd(false);
  }, [currentStepIndex]);

  const handleScrollToEnd = useCallback((scrolledToEnd: boolean) => {
    setHasScrolledToEnd(scrolledToEnd);
  }, []);

  const handleAgree = useCallback(() => {
    setAgreedSteps((prev) => new Set([...prev, currentStep.id]));

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStep.id, isLastStep, onComplete]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const renderCloseButton = () => (
    <Button
      onPress={handleCancel}
      className="size-auto min-w-0 border-none bg-transparent p-0 opacity-60 transition-opacity hover:opacity-100"
      aria-label="Close"
    >
      <X
        size={20}
        weight="light"
        className="text-gray-600 hover:text-gray-900"
      />
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      placement="center"
      hideCloseButton={true}
      size="lg"
      isDismissable={false}
      backdrop="transparent"
      className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl"
      classNames={{
        base: 'p-0 w-[480px] mobile:w-[calc(90vw)] bg-transparent',
        backdrop: 'bg-transparent backdrop-blur-none',
      }}
    >
      <ModalContent>
        <div className="flex w-full items-center justify-between border-b border-black/10 px-[20px] py-[10px]">
          <ModalHeader className="p-0 text-[16px] font-semibold text-black/80">
            Sign Up
          </ModalHeader>
          {renderCloseButton()}
        </div>

        <ModalBody className="flex flex-1 flex-col gap-[20px] overflow-hidden">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center justify-between text-[16px] font-[600] leading-[1.6] text-black/80">
              <span>{currentStep.title}</span>
              <span>
                {currentStepIndex + 1}/{AGREEMENT_STEPS.length}
              </span>
            </div>

            <p className="text-[13px]  text-black/80">Please read and accept</p>
          </div>

          <ScrollDetector
            onScrollToEnd={handleScrollToEnd}
            className="max-h-[345px] rounded-[10px] bg-[#F5F5F5] px-[20px] py-[10px]"
          >
            {currentStep.content}
          </ScrollDetector>

          <div>
            <Button
              color="secondary"
              onPress={handleAgree}
              disabled={!canProceed}
              className={cn(
                'w-full border-none',
                !canProceed
                  ? 'cursor-not-allowed opacity-30'
                  : 'cursor-pointer bg-black/5',
              )}
            >
              {isLastStep ? 'Complete' : 'Agree'}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AgreementModal;
