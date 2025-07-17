import { X } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  addToast,
  Button,
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';
import { CopyIcon } from '@/components/icons';
import SablierEntry from '@/components/sablier/SablierEntry';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';
import { isSablierDomain } from '@/utils/sablierDetector';
import { normalizeUrl } from '@/utils/url';

interface IReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: IPocItemKey;
  ref: string;
  reason?: string;
}

const ReferenceModal: FC<IReferenceModalProps> = ({
  isOpen,
  onClose,
  fieldKey,
  ref,
  reason = '',
}) => {
  const link = useMemo(() => {
    return normalizeUrl(ref);
  }, [ref]);

  const itemKeyLabel = useMemo(() => {
    return AllItemConfig[fieldKey as IPocItemKey]?.label || fieldKey;
  }, [fieldKey]);

  const onCopySuccess = useCallback(() => {
    addToast({
      title: 'Success',
      description: 'Link copied to clipboard!',
      color: 'success',
    });
  }, []);

  const isMatchSablier = useMemo(() => {
    return isSablierDomain(link);
  }, [link]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'w-[600px] max-w-[600px] m-0 p-0 bg-white',
        header: 'p-[20px]',
      }}
    >
      <ModalContent>
        <CommonModalHeader
          title={'View Reference'}
          onClose={onClose}
          classNames={{
            base: 'pb-[20px] border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
          closeIcon={<X size={20} />}
        />
        <ModalBody className="flex-col gap-[14px] p-[20px]">
          <p className="border-b border-dashed border-black/10 pb-[10px] text-[14px] text-black">
            <span>item:</span>
            <span className="ml-[10px] font-semibold">{itemKeyLabel}</span>{' '}
          </p>

          {reason && (
            <div className="flex flex-col gap-[5px]">
              <p className="text-[14px] font-[600] leading-[20px] text-black">
                Edit Reason:
              </p>
              <p className="text-[14px] leading-[20px] text-black/80">
                {reason}
              </p>
            </div>
          )}

          <div className="flex items-center overflow-hidden rounded-[8px] border border-black/10">
            <div className="flex h-[40px] flex-1 items-center truncate px-[10px] text-black">
              <span className="truncate">{link}</span>
            </div>
            <CopyToClipboard text={link!} onCopy={onCopySuccess}>
              <Button
                isIconOnly
                className="border-none bg-transparent p-0 hover:bg-gray-200"
              >
                <CopyIcon width={20} height={20} />
              </Button>
            </CopyToClipboard>
          </div>

          {isMatchSablier && (
            <div className="flex flex-col items-center gap-[10px]">
              <a href={link} target="_blank" className="w-full" rel="noreferrer">
                <Button className="w-full">View on Sablier</Button>
              </a>
              <SablierEntry />
            </div>
          )}

          <p className="text-[13px] leading-[1.2] text-black/80">
            References serve as documented sources that substantiate the
            accuracy and credibility of the input associated with an item.
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReferenceModal;
