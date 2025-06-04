import { cn } from '@heroui/react';
import { FC, useCallback, useState } from 'react';

import {
  Button,
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';
import { StorageKey_DoNotShowCancelModal } from '@/constants/storage';
import { safeSetLocalStorage } from '@/utils/localStorage';

import { ITableProposalItem } from '../ProposalDetails';

interface ICancelVoteModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  proposalItem?: ITableProposalItem;
}

const CancelVoteModal: FC<ICancelVoteModalProps> = ({
  isOpen = false,
  isLoading,
  onClose,
  onConfirm,
  proposalItem,
}) => {
  const [notShowAgain, setNotShowAgain] = useState(false);

  const handleConfirm = useCallback(() => {
    if (notShowAgain) {
      safeSetLocalStorage(StorageKey_DoNotShowCancelModal, 'true');
    }
    onConfirm();
  }, [notShowAgain, onConfirm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        body: 'p-0 mt-[20px]',
      }}
      isDismissable={false}
    >
      <ModalContent>
        <CommonModalHeader
          title={'Retract Vote?'}
          onClose={onClose}
          classNames={{
            title: 'text-[#E97D3A]',
          }}
        />
        <ModalBody>
          <div className="flex flex-col gap-[20px]">
            <div className="font-mona text-[14px] text-black opacity-80">
              You are <span className="font-[600]">removing your vote</span> for
              an item in this proposal
            </div>

            <div
              className="flex cursor-pointer items-center gap-[10px] hover:opacity-70"
              onClick={() => setNotShowAgain((pre) => !pre)}
            >
              <div
                className={cn(
                  'size-[26px] flex justify-center items-center border rounded-[5px]',
                  notShowAgain
                    ? 'border-black/20 bg-[#F5F5F5] '
                    : 'border-black/10 bg-[#EBEBEB]',
                )}
              >
                {notShowAgain ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_848_2191)">
                      <path
                        d="M2.8125 10.125L6.75 14.0625L15.75 5.0625"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_848_2191">
                        <rect width="18" height="18" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <g opacity="0.05" clipPath="url(#clip0_848_2186)">
                      <path
                        d="M2.8125 10.125L6.75 14.0625L15.75 5.0625"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_848_2186">
                        <rect width="18" height="18" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </div>

              <span className="font-mona text-[14px] text-black/80">
                Don't show this again
              </span>
            </div>

            <div className="flex justify-between gap-[10px]">
              <Button color="secondary" onPress={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleConfirm}
                className="flex-1 bg-[#E97D3A] hover:bg-[#e78244]"
                disabled={isLoading}
                isLoading={isLoading}
              >
                Retract
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CancelVoteModal;
