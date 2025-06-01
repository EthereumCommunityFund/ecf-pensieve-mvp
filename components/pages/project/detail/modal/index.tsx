'use client';

import { cn } from '@heroui/react';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import { Modal, ModalContent } from '@/components/base/modal';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IPocItemKey } from '@/types/item';

import SubmitItemProposal from '../submit/SubmitItemProposal';
import { IProjectDetailModalProps } from '../types';

import LeftContent from './LeftContent';
import { ModalProvider } from './ModalContext';
import ModalHeader from './ModalHeader';
import RightContent from './RightContent';

// 将 Modal 的 backdrop 部分分离出来，使其不受内容变化影响
const StableModalBackdrop: FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = memo(({ isOpen, onClose, children }) => {
  const modalClassNames = useMemo(
    () => ({
      base: 'max-w-[auto]',
      body: 'p-0',
      backdrop: 'backdrop-blur-[20px]',
    }),
    [],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      classNames={modalClassNames}
    >
      {children}
    </Modal>
  );
});

StableModalBackdrop.displayName = 'StableModalBackdrop';

// 将 Modal 内容部分分离，使其可以独立更新而不影响 backdrop
const ModalContentSection: FC<{
  itemKey: string;
  contentType: 'viewItemProposal' | 'submitPropose';
  currentWeight: number;
  onSubmitEntry?: () => void;
  setModalContentType: (type: 'viewItemProposal' | 'submitPropose') => void;
  onClose: () => void;
}> = memo(
  ({
    itemKey,
    contentType,
    currentWeight,
    onSubmitEntry,
    setModalContentType,
    onClose,
  }) => {
    const { profile } = useAuth();
    const { displayProposalDataOfKey, proposalsByProjectIdAndKey } =
      useProjectDetailContext();

    const showRewardCard = useMemo(() => {
      const config = AllItemConfig[itemKey as IPocItemKey];
      if (!config) return false;
      const isNotEssentialItem = !config?.isEssential;
      if (!proposalsByProjectIdAndKey) return false;
      const { leadingProposal, allItemProposals } = proposalsByProjectIdAndKey;
      if (
        isNotEssentialItem &&
        !leadingProposal &&
        (!allItemProposals || allItemProposals.length === 0)
      ) {
        return true;
      }
      return false;
    }, [proposalsByProjectIdAndKey, itemKey]);

    const itemName = useMemo(
      () =>
        AllItemConfig[itemKey as IPocItemKey]?.label ||
        itemKey?.replace('_', ' ').toUpperCase(),
      [itemKey],
    );

    const handleShare = useCallback(() => {
      console.log('Share clicked');
    }, []);

    return (
      <ModalProvider
        itemKey={itemKey}
        itemName={itemName}
        showRewardCard={showRewardCard}
      >
        <ModalContent
          className={cn(
            'p-0 m-0',
            'bg-[#FAFAFA] border border-[rgba(0,0,0,0.2)]',
            'rounded-[10px] shadow-none',
            'w-[1080px] min-h-[520px] max-h-[calc(100vh-200px)]',
          )}
        >
          {/* Header */}
          <ModalHeader
            onClose={onClose}
            onShare={handleShare}
            breadcrumbs={{
              section: 'Section',
              item: itemName,
            }}
          />

          {/* Content */}
          <div className="flex flex-1 overflow-y-auto overflow-x-hidden">
            {/* Left Content */}
            <div
              className={cn(
                'flex-1 border-r border-[rgba(0,0,0,0.1)] ',
                contentType === 'viewItemProposal' ? 'block' : 'hidden',
              )}
            >
              <LeftContent itemKey={itemKey} />
            </div>

            <div
              className={cn(
                'flex-1 border-r border-[rgba(0,0,0,0.1)] ',
                contentType === 'submitPropose' ? 'block' : 'hidden',
              )}
            >
              <SubmitItemProposal
                key={itemKey}
                itemKey={itemKey as IPocItemKey}
                displayProposalDataOfKey={displayProposalDataOfKey}
                setModalContentType={setModalContentType}
                onClose={onClose}
                onBackToSubmissionQueue={() => {
                  setModalContentType('viewItemProposal');
                }}
              />
            </div>

            {/* Right Content */}
            <div className="w-[300px]">
              <RightContent
                userWeight={Number(profile?.weight) || 0}
                currentItemWeight={currentWeight}
                onSubmitEntry={onSubmitEntry}
                hideSubmitEntry={contentType === 'submitPropose'}
                showRewardCard={showRewardCard}
              />
            </div>
          </div>
        </ModalContent>
      </ModalProvider>
    );
  },
);

ModalContentSection.displayName = 'ModalContentSection';

const ProjectDetailMainModal: FC<IProjectDetailModalProps> = ({
  isOpen,
  onClose,
  onSubmitEntry,
  itemKey,
  currentWeight = 0,
  contentType = 'viewItemProposal',
  setModalContentType,
}) => {
  const { setCurrentItemKey } = useProjectDetailContext();

  useEffect(() => {
    if (isOpen && itemKey) {
      setCurrentItemKey(itemKey);
    } else if (!isOpen && itemKey) {
      setCurrentItemKey(null);
    }
  }, [isOpen, itemKey, setCurrentItemKey]);

  const handleClose = useCallback(() => {
    setCurrentItemKey(null);
    onClose();
  }, [setCurrentItemKey, onClose]);

  return (
    <StableModalBackdrop isOpen={isOpen} onClose={handleClose}>
      {itemKey ? (
        <ModalContentSection
          itemKey={itemKey}
          contentType={contentType}
          currentWeight={currentWeight}
          onSubmitEntry={onSubmitEntry}
          setModalContentType={setModalContentType}
          onClose={handleClose}
        />
      ) : null}
    </StableModalBackdrop>
  );
};

export default ProjectDetailMainModal;
