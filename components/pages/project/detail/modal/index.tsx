'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { Modal, ModalContent } from '@/components/base/modal';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';

import LeftContent from './LeftContent';
import ModalHeader from './ModalHeader';
import RightContent from './RightContent';
import { SwitchVoteModalProps } from './types';

const SwitchVoteModal: FC<SwitchVoteModalProps> = ({
  isOpen,
  onClose,
  onSubmitEntry,
  itemName = 'ItemName',
  itemKey,
  itemWeight = 22,
  currentWeight = 0,
  userWeight = 0,
}) => {
  // 获取项目数据
  const { project } = useProjectDetail();
  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      classNames={{
        base: 'w-[1078px] max-w-[1078px]',
        body: 'p-0',
        backdrop: 'backdrop-blur-[20px]',
      }}
    >
      <ModalContent
        className={cn(
          'p-0 m-0',
          'bg-[rgba(255,255,255,0.9)] border border-[rgba(0,0,0,0.2)]',
          'rounded-[10px] shadow-none',
          'w-[1078px] h-[585px]',
          'overflow-y-auto overflow-x-hidden',
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
        <div className="flex flex-1">
          {/* Left Content */}
          <div className="flex-1">
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
      </ModalContent>
    </Modal>
  );
};

export default SwitchVoteModal;
