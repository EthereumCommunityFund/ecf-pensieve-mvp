'use client';

import { FC, useCallback, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button } from '@/components/base/button';
import { addToast } from '@/components/base/toast';
import {
  CaretDownIcon,
  CaretUpIcon,
  ShareIcon,
  XCircleIcon,
} from '@/components/icons';

interface ModalHeaderProps {
  onClose: () => void;
  breadcrumbs?: {
    section: string;
    item: string;
  };
}

const ModalHeader: FC<ModalHeaderProps> = ({
  onClose,
  breadcrumbs = { section: 'Section', item: 'Itemname' },
}) => {
  const copyLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.location.href;
  }, []);

  const onCopySuccess = useCallback(() => {
    addToast({
      title: 'Copy share link to clipboard',
      color: 'success',
    });
  }, []);

  return (
    <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] p-5">
      {/* Left side - Breadcrumbs and voting icons */}
      <div className="flex items-center gap-5">
        {/* Voting icons */}
        <div className="flex items-center gap-2.5 opacity-30">
          <div className="flex size-[18px] items-center justify-center">
            <CaretDownIcon size={18} />
          </div>
          <div className="flex size-[18px] items-center justify-center">
            <CaretUpIcon size={18} />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-[5px]">
          <span className="font-open-sans text-[16px] font-semibold leading-[1.6] text-black opacity-50">
            {breadcrumbs.section}
          </span>
          <span className="font-open-sans text-[16px] font-semibold leading-[1.6] text-black opacity-50">
            /
          </span>
          <span className="font-open-sans text-[16px] font-semibold leading-[1.6] text-black">
            {breadcrumbs.item}
          </span>
        </div>

        {/* Share button */}
        <CopyToClipboard text={copyLink} onCopy={onCopySuccess}>
          <Button
            isIconOnly
            className="size-[24px] min-w-0 border-none bg-transparent p-[2px] opacity-30"
          >
            <ShareIcon size={20} />
          </Button>
        </CopyToClipboard>
      </div>

      {/* Right side - Close button */}
      <Button
        isIconOnly
        className="size-6 min-w-0 border-none bg-transparent p-0 opacity-30"
        onPress={onClose}
      >
        <XCircleIcon size={24} />
      </Button>
    </div>
  );
};

export default ModalHeader;
