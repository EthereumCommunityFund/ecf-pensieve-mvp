import { X } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { CopyIcon } from '@/components/icons';

import { Button } from './button';
import { Modal, ModalContent } from './modal';
import { addToast } from './toast';

interface IExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const ExternalLinkModal: FC<IExternalLinkModalProps> = ({
  isOpen,
  onClose,
  url,
}) => {
  const onCopySuccess = useCallback(() => {
    addToast({
      title: 'Success',
      description: 'Link copied to clipboard!',
      color: 'success',
    });
  }, []);

  const handleOpenSite = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  }, [url, onClose]);

  const formatDisplayUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      // Remove https:// prefix for display
      const displayUrl = urlString.replace(/^https?:\/\//, '');

      if (displayUrl.length > 40) {
        return displayUrl.substring(0, 40) + '...';
      }
      return displayUrl;
    } catch {
      const displayUrl = urlString.replace(/^https?:\/\//, '');
      if (displayUrl.length > 40) {
        return displayUrl.substring(0, 40) + '...';
      }
      return displayUrl;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      hideCloseButton={true}
      classNames={{
        base: 'w-[400px] max-w-[400px] m-0 p-0 bg-white rounded-[8px]',
      }}
    >
      <ModalContent>
        <div className="relative flex flex-col gap-[14px] p-[14px]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-[14px] top-[14px] cursor-pointer rounded-full p-1 opacity-30 hover:bg-gray-100"
          >
            <X size={20} weight="bold" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-center">
            <h2 className="text-[16px] font-[600] leading-[22px] text-black">
              You are leaving Pensieve
            </h2>
          </div>

          {/* URL Input Field */}
          <div className="flex h-[40px] items-center rounded-[8px] border border-[#545568] bg-[#F5F5F5]">
            <div className="flex h-full items-center px-[10px]">
              <span className="text-[14px] font-[600] text-black">
                https://
              </span>
            </div>
            <div className="flex flex-1 items-center">
              <span className="truncate text-[14px] font-[400] text-black">
                {formatDisplayUrl(url)}
              </span>
            </div>
            <CopyToClipboard text={url} onCopy={onCopySuccess}>
              <Button
                isIconOnly
                className="border-none bg-transparent p-0 hover:bg-black/10"
              >
                <CopyIcon width={20} height={20} />
              </Button>
            </CopyToClipboard>
          </div>

          {/* Warning Message */}
          <p className="text-[14px] font-[400] leading-[20px] text-black">
            You're about to visit a link shared by another user. Please proceed
            with caution—external sites may not be safe or trustworthy.
          </p>

          {/* Open Site Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleOpenSite}
              className="h-[39px] w-full rounded-[5px] border border-black bg-white px-[20px] py-[10px] hover:bg-gray-50"
            >
              <span className="text-[14px] font-[600] text-black">
                Open Site
              </span>
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ExternalLinkModal;
