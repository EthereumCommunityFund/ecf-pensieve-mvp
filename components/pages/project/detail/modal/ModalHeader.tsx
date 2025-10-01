'use client';

import { useDisclosure } from '@heroui/react';
import { FC, useCallback, useMemo } from 'react';

import { Button } from '@/components/base/button';
import ShareModal from '@/components/biz/share/ShareModal';
import { CaretDownIcon, CaretUpIcon, XCircleIcon } from '@/components/icons';
import ShareItemIcon from '@/components/icons/ShareItem';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import useShareLink, { type ShareEntityType } from '@/hooks/useShareLink';
import { buildEmptyItemSharePayload } from '@/lib/services/share/shareCardElements';
import type { SharePayload } from '@/lib/services/share/shareService';

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
  const {
    projectId,
    project,
    proposalsByProjectIdAndKey,
    displayProposalDataOfKey,
  } = useProjectDetailContext();

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

  const emptyEntityId = useMemo(() => {
    if (!itemProposalId && projectId && itemKey) {
      return `empty:${projectId}:${encodeURIComponent(itemKey)}`;
    }
    return null;
  }, [itemProposalId, projectId, itemKey]);

  const shareEntityId = itemProposalId ?? emptyEntityId ?? projectId;
  const shareEntityType: ShareEntityType =
    itemProposalId || emptyEntityId ? 'itemProposal' : 'project';
  const shareQueryEnabled =
    typeof shareEntityId === 'number'
      ? Number.isFinite(shareEntityId) && shareEntityId > 0
      : typeof shareEntityId === 'string' && shareEntityId.length > 0;

  const {
    shareUrl,
    shareImageUrl,
    payload: sharePayload,
    loading: shareLinkLoading,
    error: shareLinkError,
    ensure: ensureShareLink,
    refresh: refreshShareLink,
  } = useShareLink({
    entityType: shareEntityType,
    entityId: shareEntityId,
    fallbackUrl,
    enabled: shareQueryEnabled,
  });

  const emptySharePayload = useMemo<SharePayload | null>(() => {
    if (itemProposalId || !project || !itemKey || !emptyEntityId) {
      return null;
    }

    return buildEmptyItemSharePayload({
      project: {
        id: project.id,
        name: project.name,
        tagline: project.tagline,
        categories: project.categories,
        logoUrl: project.logoUrl,
        isPublished: project.isPublished,
      },
      itemKey,
      fallbackUrl,
    });
  }, [emptyEntityId, itemProposalId, project, itemKey, fallbackUrl]);

  const previewPayload = useMemo<SharePayload | null>(() => {
    return sharePayload ?? emptySharePayload;
  }, [emptySharePayload, sharePayload]);

  const previewShareImageUrl = useMemo(() => {
    if (sharePayload) {
      return shareImageUrl;
    }
    return null;
  }, [shareImageUrl, sharePayload]);

  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();

  const handleSharePress = useCallback(() => {
    onOpen();

    if (shareQueryEnabled) {
      void ensureShareLink();
    }
  }, [ensureShareLink, onOpen, shareQueryEnabled]);

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
          isDisabled={shareLinkLoading}
          className="flex items-center gap-1 border-none bg-transparent px-2 py-1 opacity-60 hover:opacity-100"
          onPress={handleSharePress}
        >
          <ShareItemIcon className="size-[20px]" />
          <span className="text-sm">Share to get support</span>
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
        shareImageUrl={previewShareImageUrl}
        isLoading={shareLinkLoading}
        error={shareLinkError}
        onRefresh={refreshShareLink}
        payload={previewPayload}
      />
    </div>
  );
};

export default ModalHeader;
