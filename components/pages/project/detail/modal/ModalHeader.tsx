'use client';

import { useDisclosure } from '@heroui/react';
import { FC, useCallback, useMemo } from 'react';

import { Button } from '@/components/base/button';
import ShareModal from '@/components/biz/share/ShareModal';
import { CaretDownIcon, CaretUpIcon, XCircleIcon } from '@/components/icons';
import ShareItemIcon from '@/components/icons/ShareItem';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import useShareLink from '@/hooks/useShareLink';

import { useModalContext } from './ModalContext';

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
  const { itemKey } = useModalContext();
  const { projectId, proposalsByProjectIdAndKey, displayProposalDataOfKey } =
    useProjectDetailContext();

  const itemProposalId = useMemo(() => {
    const fromLeading =
      proposalsByProjectIdAndKey?.leadingProposal?.itemProposalId;
    if (typeof fromLeading === 'number') {
      return fromLeading;
    }

    const fromDisplayed = displayProposalDataOfKey?.proposalId;
    if (typeof fromDisplayed === 'number') {
      return fromDisplayed;
    }

    const fallbackQueueProposalId =
      proposalsByProjectIdAndKey?.allItemProposals?.find((proposal) =>
        Number.isInteger(proposal?.id),
      )?.id;

    return typeof fallbackQueueProposalId === 'number'
      ? fallbackQueueProposalId
      : undefined;
  }, [
    displayProposalDataOfKey?.proposalId,
    proposalsByProjectIdAndKey?.allItemProposals,
    proposalsByProjectIdAndKey?.leadingProposal?.itemProposalId,
  ]);

  const fallbackUrl = useMemo(() => {
    if (projectId && itemKey) {
      const encodedKey = encodeURIComponent(itemKey);
      return `/project/${projectId}?tab=project-data&notificationType=viewSubmission&itemName=${encodedKey}`;
    }
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }, [projectId, itemKey]);

  const {
    shareUrl,
    shareImageUrl,
    payload: sharePayload,
    loading: shareLinkLoading,
    error: shareLinkError,
    ensure: ensureShareLink,
    refresh: refreshShareLink,
  } = useShareLink({
    entityType: 'itemProposal',
    entityId: itemProposalId,
    fallbackUrl,
    enabled: !!itemProposalId,
  });

  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();

  const handleSharePress = useCallback(() => {
    onOpen();

    if (itemProposalId) {
      void ensureShareLink();
    }
  }, [ensureShareLink, itemProposalId, onOpen]);

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
        <Button
          isIconOnly
          isDisabled={shareLinkLoading}
          className="size-[24px] min-w-0 border-none bg-transparent p-[2px] opacity-30"
          onPress={handleSharePress}
        >
          <ShareItemIcon />
        </Button>
      </div>

      {/* Right side - Close button */}
      <Button
        isIconOnly
        className="size-6 min-w-0 border-none bg-transparent p-0 opacity-30"
        onPress={onClose}
      >
        <XCircleIcon size={24} />
      </Button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        shareUrl={shareUrl}
        shareImageUrl={shareImageUrl}
        isLoading={shareLinkLoading}
        error={shareLinkError}
        onRefresh={refreshShareLink}
        payload={sharePayload}
      />
    </div>
  );
};

export default ModalHeader;
