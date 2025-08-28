'use client';

import { FC } from 'react';

import { IPocItemKey } from '@/types/item';

import GrantsTable from './table/table';

interface ContributingFundsProps {
  projectId: number;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
}

const ContributingFunds: FC<ContributingFundsProps> = ({
  projectId,
  onOpenModal,
}) => {
  // Context is available but not used in this UI-only implementation
  // const { project } = useProjectDetailContext();

  return (
    <div className="mt-[40px] px-[20px] ">
      {/* Page Title and Description */}
      {/* <div className="mb-[32px]">
        <div className="flex items-center gap-[12px]">
          <Button
            size="sm"
            variant="bordered"
            className="h-[36px] rounded-[8px] border-black/10 bg-white px-[16px] text-[14px] font-[500] text-black hover:bg-black/5"
          >
            View Item
          </Button>
          <Button
            size="sm"
            className="h-[36px] rounded-[8px] bg-black px-[16px] text-[14px] font-[500] text-white hover:bg-black/90"
          >
            Propose Entry
          </Button>
        </div>
      </div> */}

      {/* Given (Grants) Section */}
      {/* <GivenGrantsTable projectId={projectId} /> */}

      {/* Received (Grants) Section */}
      <GrantsTable
        projectId={projectId}
        type="received"
        onOpenModal={onOpenModal}
      />
      {/* <ReceivedGrantsTable projectId={projectId} /> */}
    </div>
  );
};

export default ContributingFunds;
