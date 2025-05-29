'use client';

import { cn } from '@heroui/react';
import { FC, useEffect } from 'react';

import { Modal, ModalContent } from '@/components/base/modal';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';

import SubmitItemProposal from '../submit/SubmitItemProposal';
import { IProjectDetailModalProps } from '../types';

import LeftContent from './LeftContent';
import ModalHeader from './ModalHeader';
import RightContent from './RightContent';

const ProjectDetailMainModal: FC<IProjectDetailModalProps> = ({
  isOpen,
  onClose,
  onSubmitEntry,
  itemKey,
  itemWeight = 22,
  currentWeight = 0,
  userWeight = 0,
  contentType = 'viewItemProposal',
  setModalContentType,
}) => {
  const { profile } = useAuth();
  const { projectId, setCurrentItemKey, displayProposalDataOfKey } =
    useProjectDetailContext();

  useEffect(() => {
    if (isOpen && itemKey) {
      setCurrentItemKey(itemKey);
    } else if (!isOpen && itemKey) {
      setCurrentItemKey(null);
    }
  }, [isOpen, itemKey, setCurrentItemKey]);

  const handleClose = () => {
    setCurrentItemKey(null);
    onClose();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  const itemName =
    AllItemConfig[itemKey]?.label || itemKey?.replace('_', ' ').toUpperCase();

  const showSubmit = contentType === 'submitPropose';

  // Modal content component
  const ModalContentComponent = () => (
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
        onClose={handleClose}
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
          <LeftContent
            itemName={itemName}
            itemWeight={itemWeight}
            itemKey={itemKey}
          />
        </div>

        <div
          className={cn(
            'flex-1 border-r border-[rgba(0,0,0,0.1)] ',
            contentType === 'submitPropose' ? 'block' : 'hidden',
          )}
        >
          <SubmitItemProposal
            itemKey={itemKey}
            displayProposalDataOfKey={displayProposalDataOfKey}
            setModalContentType={setModalContentType}
          />
        </div>

        {/* Right Content */}
        <div className="w-[300px]">
          <RightContent
            userWeight={Number(profile?.weight) || 0}
            currentItemWeight={currentWeight}
            onSubmitEntry={onSubmitEntry}
            hideSubmitEntry={contentType === 'submitPropose'}
          />
        </div>
      </div>
    </ModalContent>
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      classNames={{
        base: 'max-w-[auto]',
        body: 'p-0',
        backdrop: 'backdrop-blur-[20px]',
      }}
    >
      {itemKey ? <ModalContentComponent /> : null}
    </Modal>
  );
};

export default ProjectDetailMainModal;
