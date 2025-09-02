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
    <div className="mt-[20px] px-[20px] ">
      {/* Header Section - Funding Received (Grants) */}
      <div className="mb-[20px] flex flex-col gap-[10px]">
        <h2 className="text-[18px] font-[700] leading-[25px] text-black/80">
          Item: Funding Received (Grants)
        </h2>
        <p className="text-[14px] font-[600] leading-[19px] text-black/40">
          Track the financial support this project has received through grants
          and donations.
        </p>
        {/* hide view item and propose entry buttons */}
        {/* <div className="flex items-center gap-[10px]">
          <button
            onClick={() => {
              onOpenModal?.('funding_received_grants', 'viewItemProposal');
            }}
            className="flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#F0F0F0] px-[10px] text-[14px] font-[600] leading-[19px] text-black transition-colors hover:bg-[#E0E0E0]"
          >
            View Item
          </button>
          <button
            onClick={() => {
              onOpenModal?.('funding_received_grants', 'submitPropose');
            }}
            className="flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#F0F0F0] px-[10px] text-[14px] font-[600] leading-[19px] text-black transition-colors hover:bg-[#E0E0E0]"
          >
            Propose Entry
          </button>
        </div> */}
      </div>

      {/* Given (Grants) Section */}
      <GrantsTable
        projectId={projectId}
        type="given"
        onOpenModal={onOpenModal}
      />

      {/* Received (Grants) Section */}
      <GrantsTable
        projectId={projectId}
        type="received"
        onOpenModal={onOpenModal}
      />
    </div>
  );
};

export default ContributingFunds;
