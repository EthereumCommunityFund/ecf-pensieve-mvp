'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, ReferenceCol, SubmitterCol } from '@/components/biz/table';
import { TooltipTh } from '@/components/biz/table/TooltipThWithPin';
import { AllItemConfig } from '@/constants/itemConfig';
import { QUORUM_AMOUNT } from '@/lib/constants';
import { IItemProposalVoteRecord } from '@/types';
import { IPocItemKey } from '@/types/item';

import { IProjectTableRowData, ITableMetaOfSubmissionQueue } from '../types';

import SupportColumnItem from './SupportColumnItem';

export const useCommonColumnsOfModal = () => {
  const columnHelper = useMemo(
    () => createColumnHelper<IProjectTableRowData>(),
    [],
  );

  return useMemo(() => {
    // Current Input Column
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;
        const {
          toggleRowExpanded,
          expandedRows,
          showRowOverTaken,
          showRowIsLeading,
          isLeadingProposalNotLeading,
        } = info.table.options.meta as ITableMetaOfSubmissionQueue;

        // Generate unique identifier - consistent with logic in SubmissionQueue component
        const uniqueId = item.proposalId
          ? `proposal-${item.proposalId}`
          : `key-${item.key}`;
        const isRowExpanded = expandedRows[uniqueId];

        // Check if current row is the first and in over-taken state
        const isFirstRowOverTaken = showRowOverTaken && info.row.index === 0;

        // Check if current row is the first and in leading state
        const isFirstRowLeading = showRowIsLeading && info.row.index === 0;

        return (
          <InputCol.Cell
            value={info.getValue()}
            item={item}
            itemKey={item.key as any}
            isExpanded={isRowExpanded}
            onToggleExpand={
              toggleRowExpanded ? () => toggleRowExpanded(uniqueId) : undefined
            }
            showOverTakenStatus={isFirstRowOverTaken}
            showLeadingStatus={isFirstRowLeading}
            isLeadingProposalNotLeading={isLeadingProposalNotLeading}
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
        const { showReferenceModal } = info.table.options
          .meta as ITableMetaOfSubmissionQueue;
        return (
          <ReferenceCol.Cell
            hasReference={!!referenceValue}
            onShowReference={() => {
              showReferenceModal?.(
                referenceValue?.value || '',
                item.key as IPocItemKey,
                item.reason || '',
              );
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
        const { showSubmitterModal } = info.table.options
          .meta as ITableMetaOfSubmissionQueue;

        return (
          <SubmitterCol.Cell
            item={rowData}
            itemConfig={AllItemConfig[rowData.key as IPocItemKey]!}
            submitter={submitterData}
            data={rowData.createdAt}
            showSubmitterModal={showSubmitterModal}
          />
        );
      },
    });

    // Support Column
    const supportColumn = columnHelper.accessor('support', {
      id: 'support',
      header: () => (
        <TooltipTh
          title="Support"
          tooltipContext="Number of supporters for this property"
        />
      ),
      size: 150,
      cell: (info) => {
        const support = info.getValue();
        const {
          onCreateItemProposalVote,
          onSwitchItemProposalVote,
          onCancelVote,
          displayProposalDataListOfProject,
          proposalsByProjectIdAndKey,
          project,
          profile,
          // inActionKeyMap, // No longer taken from meta
          // inActionItemProposalIdMap, // No longer taken from meta
        } = info.table.options.meta as ITableMetaOfSubmissionQueue;

        // Get the latest status directly from context
        // const { inActionItemProposalIdMap, inActionKeyMap } = useProjectDetailContext(); // No longer needed here
        // SupportColumnItem will get inActionItemProposalIdMap from context directly

        const itemKey = info.row.original.key as IPocItemKey;
        const itemProposalId = info.row.original.proposalId;
        const itemTopWeight =
          (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[itemKey] ||
          0;

        const { leadingProposal = null, allItemProposals = [] } =
          proposalsByProjectIdAndKey || {};

        const allItemProposalVoteRecords = allItemProposals.flatMap(
          (item) => item.voteRecords,
        ) as IItemProposalVoteRecord[];

        const votesRecordsOfLeadingProposal =
          leadingProposal?.itemProposal?.voteRecords || [];

        // 1. Whether voted for this key in project leading proposal
        const isUserVotedKeyInLeadingProposal =
          !!votesRecordsOfLeadingProposal?.find(
            (vote) => vote.creator === profile?.userId,
          );

        const userVotedItemProposal = allItemProposalVoteRecords.find(
          (item) => item.creator === profile?.userId,
        );

        const userVoteRecords = allItemProposalVoteRecords.filter(
          (item) => item.creator === profile?.userId,
        );

        // 2. Whether voted for this key in item proposals
        const isUserVotedKeyInItemProposals = userVoteRecords.length > 0;
        // 3. Whether voted for this one
        const isUserVotedCurrentItemProposal = !!userVoteRecords.find(
          (voteRecord) => voteRecord.itemProposalId === itemProposalId,
        );

        const showQuorum =
          !AllItemConfig[itemKey]?.isEssential && !leadingProposal;

        // Based on whether user voted in current item proposal
        const isUserVoted = isUserVotedCurrentItemProposal;

        // Check if current user is the creator of this item proposal
        const proposalCreator = info.row.original.submitter;
        const isProposalCreator = !!(
          profile?.userId &&
          proposalCreator &&
          proposalCreator.userId === profile.userId
        );

        // Calculate isReachQuorum based on support data and requirements
        const isReachQuorum = support.voters >= QUORUM_AMOUNT;

        return (
          <SupportColumnItem
            proposalId={info.row.original.proposalId}
            itemKey={itemKey}
            itemPoints={support.count}
            itemPointsNeeded={itemTopWeight}
            showQuorum={showQuorum}
            votedMemberCount={support.voters}
            isReachQuorum={isReachQuorum}
            isUserVoted={isUserVoted}
            // isLoading={!!isLoading} // No longer passed as prop
            isProposalCreator={isProposalCreator}
            onCreateItemProposalVote={onCreateItemProposalVote}
            onSwitchItemProposalVote={onSwitchItemProposalVote}
            onCancelVote={onCancelVote}
            displayProposalDataListOfProject={displayProposalDataListOfProject}
            proposalsByProjectIdAndKey={proposalsByProjectIdAndKey}
            isUserVotedInProposalOrItemProposals={
              isUserVotedKeyInLeadingProposal || isUserVotedKeyInItemProposals
            }
            isUserVotedCurrentItemProposal={isUserVotedCurrentItemProposal}
            userVotedItemProposal={
              userVotedItemProposal as IItemProposalVoteRecord
            }
          />
        );
      },
    });

    return [inputColumn, referenceColumn, submitterColumn, supportColumn];
  }, [columnHelper]);
};
