'use client';

import { cn } from '@heroui/react';
import { FC, useEffect, useMemo, useState } from 'react';

import {
  Button,
  CommonModalHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';

interface IUpvoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => Promise<void>;
  onWithdraw?: () => Promise<void>;
  availableCP: number;
  currentUserWeight?: number;
  isConfirmLoading?: boolean;
  isWithdrawLoading?: boolean;
  hasUserUpvoted?: boolean;
}

const UpvoteModal: FC<IUpvoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onWithdraw,
  availableCP,
  currentUserWeight = 0,
  isConfirmLoading = false,
  isWithdrawLoading = false,
  hasUserUpvoted = false,
}) => {
  const [inputValue, setInputValue] = useState(
    hasUserUpvoted ? currentUserWeight.toString() : '',
  );
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(hasUserUpvoted ? currentUserWeight.toString() : '');
    setIsValid(true);
  }, [hasUserUpvoted, currentUserWeight, isOpen]);

  const isButtonDisabled = useMemo(() => {
    return !isValid || !inputValue || isConfirmLoading || isWithdrawLoading;
  }, [isValid, inputValue, isConfirmLoading, isWithdrawLoading]);

  const inputErrorMessage = useMemo(() => {
    const message = `You don't have enough CP left. Need to withdraw from other supported projects or earn more CP.`;
    return !isValid ? message : undefined;
  }, [isValid]);

  const handleInputChange = (value: string) => {
    // Only allow digits, and must not start with 0 (unless empty)
    if (value !== '' && !/^[1-9]\d*$/.test(value)) {
      return; // Reject any invalid input
    }

    setInputValue(value);

    if (value === '' || value.trim() === '') {
      setIsValid(true);
      return;
    }

    const numValue = parseInt(value, 10);
    let isValidNumber = !isNaN(numValue) && numValue > 0;

    // For both new votes and updates: must be greater than 0 and not exceed available CP
    isValidNumber = isValidNumber && numValue <= availableCP;

    setIsValid(isValidNumber);
  };

  const handleConfirm = async () => {
    const weight = parseFloat(inputValue);
    if (isValid && weight > 0) {
      await onConfirm(weight);
    }
  };

  const handleWithdraw = async () => {
    if (onWithdraw) {
      await onWithdraw();
    }
  };

  const handleClose = () => {
    setInputValue(hasUserUpvoted ? currentUserWeight.toString() : '');
    setIsValid(true);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      classNames={{
        base: 'w-[300px] mobile:w-[300px] m-0 p-0 bg-white',
        body: 'p-[20px] mobile:p-[20px]',
        header: 'p-[20px]',
      }}
      isDismissable={!isConfirmLoading && !isWithdrawLoading}
    >
      <ModalContent>
        <CommonModalHeader
          title="Upvote Project"
          onClose={handleClose}
          isDisabled={isConfirmLoading || isWithdrawLoading}
          classNames={{
            base: 'border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
        />
        <ModalBody>
          <div className="flex flex-col gap-[20px]">
            <p className="text-[13px] text-black/80">
              Allocate an amount of your CP to support this project. This
              signals your trust in this project to the community.
            </p>

            <div className="flex flex-col">
              <Input
                type="text"
                placeholder="Enter amount"
                value={inputValue}
                onValueChange={handleInputChange}
                disabled={isConfirmLoading || isWithdrawLoading}
                isInvalid={!isValid}
                errorMessage={inputErrorMessage}
              />
              <div className="flex justify-end px-[8px] py-[4px] opacity-60">
                <p className="text-[14px] font-[600] text-black/80">
                  {availableCP} left
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                color="secondary"
                onPress={handleConfirm}
                className={cn(
                  'w-full border-none bg-black/5',
                  isButtonDisabled && 'opacity-30 cursor-not-allowed',
                )}
                disabled={isButtonDisabled}
                isLoading={isConfirmLoading}
              >
                {hasUserUpvoted ? 'Update Vote' : 'Confirm Vote'}
              </Button>
            </div>

            {hasUserUpvoted && (
              <Button
                color="secondary"
                className="w-full"
                disabled={isWithdrawLoading}
                isLoading={isWithdrawLoading}
                onPress={handleWithdraw}
              >
                Withdraw all CP
              </Button>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UpvoteModal;
