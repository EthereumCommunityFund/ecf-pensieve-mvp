'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, ReferenceCol, SubmitterCol } from '@/components/biz/table';
import { QuestionIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { IItemProposalVoteRecord } from '@/types';
import { IPocItemKey } from '@/types/item';

import SupportColumnItem from './SupportColumnItem';
import { ITableMeta, TableRowData } from './types';

// Displayed Table Columns Hook
interface UseDisplayedColumnsProps {
  onReferenceClick?: (rowId: string) => void;
  onExpandClick?: (rowId: string) => void;
  expandedRows?: Record<string, boolean>;
  toggleRowExpanded?: (key: string) => void;
}

export const useDisplayedColumns = ({
  onReferenceClick,
  onExpandClick,
  expandedRows = {},
  toggleRowExpanded,
}: UseDisplayedColumnsProps = {}) => {
  const columnHelper = useMemo(() => createColumnHelper<TableRowData>(), []);

  return useMemo(() => {
    // Current Input Column
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;
        const isRowExpanded = expandedRows[item.key];

        return (
          <InputCol.Cell
            value={info.getValue()}
            itemKey={item.key as any}
            isExpanded={isRowExpanded}
            onToggleExpand={
              toggleRowExpanded ? () => toggleRowExpanded(item.key) : undefined
            }
          />
        );
      },
    });

    // Reference Column
    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => <ReferenceCol.Header />,
      size: 124,
      cell: (info) => {
        const item = info.row.original;
        const referenceValue = info.getValue();

        return (
          <ReferenceCol.Cell
            hasReference={!!referenceValue}
            onShowReference={() => {
              onReferenceClick?.(item.key);
              console.log('Show reference for:', item.key, referenceValue);
            }}
          />
        );
      },
    });

    // Submitter Column
    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => <SubmitterCol.Header />,
      size: 183,
      cell: (info) => {
        const rowData = info.row.original;
        const submitterData = info.getValue();

        return (
          <SubmitterCol.Cell
            item={rowData}
            itemConfig={AllItemConfig[rowData.key as IPocItemKey]!}
            submitter={submitterData}
            data={rowData.createdAt}
          />
        );
      },
    });

    // Support Column
    const supportColumn = columnHelper.accessor('support', {
      id: 'support',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Support
          </span>
          <QuestionIcon size={18} />
        </div>
      ),
      size: 150,
      cell: (info) => {
        const support = info.getValue();
        const {
          onCreateItemProposalVote,
          onSwitchItemProposalVote,
          onCancelVote,
          displayProposalData,
          proposalsByKey,
          project,
          profile,
        } = info.table.options.meta as ITableMeta;
        const itemTopWeight =
          (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[
            info.row.original.key as IPocItemKey
          ] || 0;
        // TODO 抽取到 context里面去
        const { leadingProposal = null, allItemProposals = [] } =
          proposalsByKey || {};
        const allItemProposalVoteRecords = allItemProposals.flatMap(
          (item) => item.voteRecords,
        ) as IItemProposalVoteRecord[];
        const userVotedItemProposal = allItemProposalVoteRecords.find(
          (item) => item.creator === profile?.userId,
        );
        // 1、是否在proposal中投过票、是否在item proposal中投过票、是否投了当前这一条
        const isUserVotedKey = !!userVotedItemProposal;
        const isUserVotedItemProposal =
          isUserVotedKey &&
          userVotedItemProposal?.itemProposalId ===
            info.row.original.proposalId;
        return (
          <SupportColumnItem
            proposalId={info.row.original.proposalId}
            itemKey={info.row.original.key as IPocItemKey}
            itemPoints={support.count}
            itemPointsNeeded={itemTopWeight}
            votedMemberCount={support.voters}
            isReachQuorum={false}
            isUserVoted={false}
            isLoading={false}
            isProposalCreator={false}
            onCreateItemProposalVote={onCreateItemProposalVote}
            onSwitchItemProposalVote={onSwitchItemProposalVote}
            onCancelVote={onCancelVote}
            displayProposalData={displayProposalData}
            proposalsByKey={proposalsByKey}
            isUserVotedKey={isUserVotedKey}
            isUserVotedItemProposal={isUserVotedItemProposal}
            userVotedItemProposal={
              userVotedItemProposal as IItemProposalVoteRecord
            }
          />
        );
      },
    });

    return [inputColumn, referenceColumn, submitterColumn, supportColumn];
  }, [columnHelper, onReferenceClick, expandedRows, toggleRowExpanded]);
};
