import { X } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';

import { IRef } from '../../../create/types';
import { FIELD_LABELS } from '../constants';

interface IReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string;
  refs: IRef[];
}

const ReferenceModal: FC<IReferenceModalProps> = ({
  isOpen,
  onClose,
  fieldKey,
  refs,
}) => {
  const refMap = useMemo(() => {
    return refs.reduce(
      (acc, ref) => {
        return {
          ...acc,
          [ref.key]: ref.value,
        };
      },
      {} as Record<string, string>,
    );
  }, [refs]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'w-[600px] max-w-[600px] m-0 p-0',
        header: 'p-[20px]',
      }}
    >
      <ModalContent>
        <CommonModalHeader
          title={'Reference'}
          onClose={onClose}
          classNames={{
            base: 'pb-[20px] border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
          closeIcon={<X size={20} />}
        />
        <ModalBody className="flex-col gap-[20px] p-[20px]">
          <div>
            <p className="pb-[20px] text-[14px] text-black">
              <span>item:</span>
              <span className="ml-[10px] font-semibold">
                {FIELD_LABELS[fieldKey] || fieldKey}
              </span>{' '}
            </p>
            <p className="border-b border-dashed border-[rgba(0,0,0,0.1)] pb-[20px] text-[14px] text-black">
              <span>Reference Link:</span>
              <span className="ml-[10px] font-semibold">
                {refMap[fieldKey]}
              </span>
            </p>
          </div>

          <p className="mt-3 text-[13px] leading-[1.2] text-black/80">
            References serve as documented sources that substantiate the
            accuracy and credibility of the input associated with an item. This
            will help with community validation.
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReferenceModal;
