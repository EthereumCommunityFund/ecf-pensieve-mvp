'use client';

import { Skeleton, useDisclosure } from '@heroui/react';
import React from 'react';

import { Button } from '@/components/base/button';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base/modal';
import { ShieldStarIcon } from '@/components/icons';
import { TotalItemCount } from '@/constants/tableConfig';

interface ITransparentScoreProps {
  displayedCount: number;
  isDataFetched: boolean;
}

const TransparentScore: React.FC<ITransparentScoreProps> = ({
  displayedCount,
  isDataFetched,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const emptyCount = TotalItemCount - displayedCount;
  const score =
    TotalItemCount > 0
      ? Math.round((displayedCount / TotalItemCount) * 100)
      : 0;

  return (
    <>
      <Button
        onPress={onOpen}
        className="h-auto rounded-[6px] bg-transparent px-[10px] py-[8px]"
        disabled={!isDataFetched}
      >
        <div className="flex items-center justify-between gap-[10px]">
          <ShieldStarIcon />
          <div className="text-left">
            <div className="flex shrink-0 items-center justify-start gap-[5px] text-[14px] font-[600] leading-[19px] text-black">
              Transparency Score:
              {isDataFetched ? (
                <span>{score}%</span>
              ) : (
                <Skeleton className="inline-block h-[19px] w-[40px] rounded-[4px]" />
              )}
            </div>
            <div className="flex shrink-0 items-center justify-start gap-[5px] text-[12px] font-[600]  leading-[16px] text-black/60">
              Items left:
              {isDataFetched ? (
                <span>{emptyCount}</span>
              ) : (
                <Skeleton className="inline-block h-[16px] w-[20px] rounded-[4px]" />
              )}
            </div>
          </div>
        </div>
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          base: 'bg-white p-[0]',
          body: 'p-[20px]',
        }}
      >
        <ModalContent>
          <CommonModalHeader
            title="Page Transparency?"
            onClose={onClose}
            classNames={{
              base: 'px-[20px] py-[10px] border-b border-black/10',
              title: 'text-[16px] text-black/80',
            }}
          />
          <ModalBody className="flex flex-col gap-[20px]">
            <div className="flex items-center justify-center gap-[10px] rounded-[6px] border border-black/10 px-[10px] py-[8px]">
              <ShieldStarIcon />
              <div className="text-left">
                <p className="text-[14px] font-[600] leading-[19px] text-black">
                  Transparency Score: {score}%
                </p>
                <p className="text-[12px] font-[600] leading-[16px] text-black/60">
                  Items left: {emptyCount}
                </p>
              </div>
            </div>
            <p className="text-[14px] text-black/80">
              The Transparency Score is a simple gauge of a page’s completion
              rate. Based on how many items have been proposed vs how many empty
              items remain. This establishes a basic level of a page’s
              transparency in how it reflects information to the project it is
              representing.
            </p>
            <p className="text-[14px] font-[600] text-black/80">
              To contribute to this page’s transparency, you can find items to
              propose displayed under each table.
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransparentScore;
