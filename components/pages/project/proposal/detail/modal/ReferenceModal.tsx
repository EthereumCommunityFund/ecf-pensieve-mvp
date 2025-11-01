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
import { useExternalLink } from '@/context/ExternalLinkContext';
import { IEssentialItemKey } from '@/types/item';
import { isSablierDomain } from '@/utils/sablierDetector';
import { normalizeUrl } from '@/utils/url';

import { IRef } from '../../../create/types';

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
  const { openExternalLink } = useExternalLink();

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

  const link = useMemo(() => {
    return normalizeUrl(refMap[fieldKey]) || fieldKey;
  }, [refMap, fieldKey]);

  const isMatchSablier = useMemo(() => {
    return isSablierDomain(link);
  }, [link]);

  const onCopySuccess = useCallback(() => {
    addToast({
      title: 'Success',
      description: 'Link copied to clipboard!',
      color: 'success',
    });
  }, []);

  const handleLinkClick = useCallback(() => {
    openExternalLink(link);
  }, [link, openExternalLink]);

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
          title={'View Reference'}
          onClose={onClose}
          classNames={{
            base: 'pb-[20px] border-b border-[rgba(0,0,0,0.1)]',
            title: 'text-black/80 text-[16px]',
          }}
          closeIcon={<X size={20} />}
        />
        <ModalBody className="flex-col gap-[20px] p-[20px]">
          <p className="border-b border-dashed border-black/10 pb-[10px] text-[14px] text-black">
            <span>item:</span>
            <span className="ml-[10px] font-semibold">
              {AllItemConfig[fieldKey as IEssentialItemKey]?.label || fieldKey}
            </span>{' '}
          </p>

          <div className="flex items-center overflow-hidden rounded-[8px] border border-black/10">
            <div
              className="flex h-[40px] flex-1 cursor-pointer items-center truncate px-[10px] text-black hover:bg-gray-50"
              onClick={handleLinkClick}
            >
              <span className="truncate underline">{link}</span>
            </div>
            <CopyToClipboard text={link} onCopy={onCopySuccess}>
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
              <Button className="w-full" onClick={handleLinkClick}>
                View on Sablier
              </Button>
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
