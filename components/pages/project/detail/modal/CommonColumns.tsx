'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, ReferenceCol, SubmitterCol } from '@/components/biz/table';
import { QuestionIcon } from '@/components/icons';
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
        } = info.table.options.meta as ITableMetaOfSubmissionQueue;

        // 生成唯一标识符 - 与SubmissionQueue组件中的逻辑保持一致
        const uniqueId = item.proposalId
          ? `proposal-${item.proposalId}`
          : `key-${item.key}`;
        const isRowExpanded = expandedRows[uniqueId];

        // 检查当前行是否是第一行且处于 over-taken 状态
        const isFirstRowOverTaken = showRowOverTaken && info.row.index === 0;

        // 检查当前行是否是第一行且处于 leading 状态
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

        // TODO 抽取到 context里面去
        const { leadingProposal = null, allItemProposals = [] } =
          proposalsByProjectIdAndKey || {};

        const allItemProposalVoteRecords = allItemProposals.flatMap(
          (item) => item.voteRecords,
        ) as IItemProposalVoteRecord[];

        const votesRecordsOfLeadingProposal =
          leadingProposal?.itemProposal?.voteRecords || [];

        // 1、是否在project leading proposal中投过这个 key 的票
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

        // 2、是否在item proposals中投过这个 key 票
        const isUserVotedKeyInItemProposals = userVoteRecords.length > 0;
        // 3、是否投了当前这一条
        const isUserVotedCurrentItemProposal = !!userVoteRecords.find(
          (voteRecord) => voteRecord.itemProposalId === itemProposalId,
        );

        const showQuorum =
          !AllItemConfig[itemKey]?.isEssential && !leadingProposal;

        // isLoading is no longer calculated or passed from here.
        // console.log('[CommonColumns] Calculated isLoading for proposalId', itemProposalId, ':', isLoading, 'from map:', JSON.stringify(inActionItemProposalIdMap));

        // Implement isUserVoted logic
        // 基于用户是否在当前 item proposal 中投票
        const isUserVoted = isUserVotedCurrentItemProposal;

        // Implement isProposalCreator logic
        // 检查当前用户是否为该 item proposal 的创建者
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
