'use client';

import { cn } from '@heroui/react';
import { FC, useMemo, useState } from 'react';

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
  availableCP: number;
  currentUserWeight?: number;
  isLoading?: boolean;
  hasUserUpvoted?: boolean;
}

const UpvoteModal: FC<IUpvoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  availableCP,
  currentUserWeight = 0,
  isLoading = false,
  hasUserUpvoted = false,
}) => {
  const [inputValue, setInputValue] = useState(
    hasUserUpvoted ? currentUserWeight.toString() : '',
  );
  const [isValid, setIsValid] = useState(true);

  const isButtonDisabled = useMemo(() => {
    return !isValid || !inputValue || isLoading;
  }, [isValid, inputValue, isLoading]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    const numValue = parseFloat(value);
    let isValidNumber = !isNaN(numValue) && numValue > 0;

    // For both new votes and updates: must be greater than 0 and not exceed available CP
    isValidNumber = isValidNumber && numValue <= availableCP;

    setIsValid(isValidNumber);
  };

  const handleConfirm = async () => {
    const weight = parseFloat(inputValue);
    if (isValid && weight > 0) {
      await onConfirm(weight);
      setInputValue('');
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
      isDismissable={!isLoading}
    >
      <ModalContent>
        <CommonModalHeader
          title="Upvote Project"
          onClose={handleClose}
          isDisabled={isLoading}
          classNames={{
            base: 'border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
        />
        <ModalBody>
          <div className="flex flex-col gap-[20px]">
            <p className="text-[13px] text-black/80">
              Allocate an amount of your CP to support this project
            </p>

            <div className="flex flex-col">
              <Input
                type="number"
                placeholder="Enter amount"
                value={inputValue}
                onValueChange={handleInputChange}
                disabled={isLoading}
                isInvalid={!isValid}
                errorMessage={
                  !isValid
                    ? `Please enter a valid amount between 1 and ${availableCP}`
                    : undefined
                }
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
                isLoading={isLoading}
              >
                {hasUserUpvoted ? 'Update Vote' : 'Confirm Vote'}
              </Button>
            </div>

            {hasUserUpvoted && (
              <Button color="secondary" className="w-full" disabled={isLoading}>
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
