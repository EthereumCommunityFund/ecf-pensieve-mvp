'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { Modal, ModalContent } from '@/components/base/modal';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';

import { ModalProvider } from './Context';
import LeftContent from './LeftContent';
import ModalHeader from './ModalHeader';
import RightContent from './RightContent';
import SubmitItemProposal from './SubmitItemProposal';
import { IProjectDetailModalProps } from './types';

const ProjectDetailMainModal: FC<IProjectDetailModalProps> = ({
  isOpen,
  onClose,
  onSubmitEntry,
  itemName = 'ItemName',
  itemKey,
  itemWeight = 22,
  currentWeight = 0,
  userWeight = 0,
  contentType = 'viewItemProposal',
}) => {
  // 获取项目数据
  const { projectId } = useProjectDetail();
  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  // Modal content component
  const ModalContentComponent = () => (
    <ModalContent
      className={cn(
        'p-0 m-0',
        'bg-[#FAFAFA] border border-[rgba(0,0,0,0.2)]',
        'rounded-[10px] shadow-none',
        'w-[1080px] h-[585px]',
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
      {contentType === 'viewItemProposal' ? (
        <div className="flex flex-1 overflow-y-auto overflow-x-hidden">
          {/* Left Content */}
          <div className="flex-1 border-r border-[rgba(0,0,0,0.1)] ">
            <LeftContent
              itemName={itemName}
              itemWeight={itemWeight}
              itemKey={itemKey}
            />
          </div>

          {/* Right Content */}
          <div className="w-[300px]">
            <RightContent
              userWeight={userWeight}
              currentItemWeight={currentWeight}
              onSubmitEntry={onSubmitEntry}
            />
          </div>
        </div>
      ) : (
        <SubmitItemProposal />
      )}
    </ModalContent>
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      classNames={{
        base: 'max-w-[auto]',
        body: 'p-0',
        backdrop: 'backdrop-blur-[20px]',
      }}
    >
      {/* Wrap content with ModalProvider if itemKey is available */}
      {itemKey ? (
        <ModalProvider projectId={projectId} itemKey={itemKey}>
          <ModalContentComponent />
        </ModalProvider>
      ) : null}
    </Modal>
  );
};

export default ProjectDetailMainModal;
