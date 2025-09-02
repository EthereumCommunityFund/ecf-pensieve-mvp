import { ModalBody, Skeleton } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import Image from 'next/image';

import {
  CommonModalHeader,
  Modal,
  ModalContent,
} from '@/components/base/modal';
import { trpc } from '@/lib/trpc/client';
import { formatDate } from '@/utils/formatters';

import { IProposalCreator } from '../types';

interface SubmitterModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitter: IProposalCreator | null;
  validatedAt: Date | null;
}

const SubmitterModal = ({
  isOpen,
  onClose,
  submitter,
  validatedAt,
}: SubmitterModalProps) => {
  const { data: user, isFetching } = trpc.user.getUserByAddress.useQuery(
    {
      address: submitter?.address || '',
    },
    {
      enabled: !!submitter?.address,
    },
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      classNames={{
        base: 'p-0 bg-white',
        body: 'p-[14px] mobile:p-[10px] gap-[14px]',
        header: 'p-[20px]',
      }}
    >
      <ModalContent>
        <CommonModalHeader
          title={'View Leading Submitter'}
          onClose={onClose}
          classNames={{
            base: 'pb-[20px] border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
          closeIcon={<X size={20} />}
        />
        <ModalBody>
          <div className="flex items-center gap-[10px]">
            <Image
              src={submitter?.avatarUrl || '/images/user/avatar_p.png'}
              alt={submitter?.name || ''}
              width={60}
              height={60}
              className="size-[60px] rounded-full object-cover"
            />
            <div className="flex flex-col gap-[5px]">
              <p className="text-[14px] font-[600] leading-[20px] text-black">
                {submitter?.name}
              </p>
              <div className="flex items-center gap-[4px] text-[12px] font-[400] leading-[10px] text-black/60">
                <span>user weight: {` `}</span>
                {isFetching ? (
                  <Skeleton className="h-[12px] w-[30px]" />
                ) : (
                  <p>{user?.weight || 0}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[5px]">
            <p className="text-[14px] font-[600] leading-[20px] text-black">
              Submission Validated on:
            </p>
            <p className="text-[14px] leading-[20px] text-black/80">
              {formatDate(validatedAt, 'YYYY-MM-DD HH:mm:ss', '0000-00-00')}
            </p>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SubmitterModal;
