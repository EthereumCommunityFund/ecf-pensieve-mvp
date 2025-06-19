'use client';

import { X } from '@phosphor-icons/react';
import React, { useCallback, useEffect, useState } from 'react';

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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-end px-5 py-3">
      <span className="text-sm text-gray-600">
        {currentStepIndex + 1}/{AGREEMENT_STEPS.length}
      </span>
    </div>
  );

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
      backdrop="opaque"
      className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl"
      classNames={{
        base: 'p-0 w-[420px] mobile:w-[calc(90vw)]',
        backdrop: 'bg-gray-900/30 backdrop-blur-sm',
      }}
    >
      <ModalContent className="flex max-h-[90vh] flex-col">
        <div className="flex w-full items-center justify-between border-b border-gray-200 p-5">
          <ModalHeader className="p-0 text-lg font-semibold text-gray-900">
            Sign Up
          </ModalHeader>
          {renderCloseButton()}
        </div>

        <div className="border-b border-gray-200">
          {renderStepIndicator()}
          <div className="px-5 pb-4">
            <h3 className="mb-2 text-base font-medium text-gray-900">
              {currentStep.title}
            </h3>
            <p className="text-sm text-gray-600">Please read and accept</p>
          </div>
        </div>

        <ModalBody className="flex-1 overflow-hidden p-0">
          <ScrollDetector onScrollToEnd={handleScrollToEnd}>
            {currentStep.content}
          </ScrollDetector>
        </ModalBody>

        <div className="border-t border-gray-200 p-5">
          <div className="flex justify-center">
            <Button
              color="primary"
              onPress={handleAgree}
              disabled={!canProceed}
              className={`px-8 py-2 ${
                !canProceed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              style={{
                cursor: !canProceed ? 'not-allowed' : 'pointer',
              }}
            >
              {isLastStep ? 'Complete' : 'Agree'}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default AgreementModal;
