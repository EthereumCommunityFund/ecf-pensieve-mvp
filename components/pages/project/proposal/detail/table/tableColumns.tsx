'use client';

import { cn } from '@heroui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Button } from '@/components/base';
import { CaretDownIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { ESSENTIAL_ITEM_MAP } from '@/lib/constants';
import { IProject, IProposal } from '@/types';
import { IEssentialItemKey } from '@/types/item';

import { ITableProposalItem } from '../ProposalDetails';

import InputContentRenderer from './InputContentRenderer';
import TooltipItemWeight from './TooltipItemWeight';
import TooltipTh from './TooltipTh';
import VoteItem from './VoteItem';

export interface TableCellsMeta {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  onShowReference: (key: string) => void;
  project?: IProject;
  proposal?: IProposal;
  onVoteAction: (item: ITableProposalItem) => Promise<void>;
  isFetchVoteInfoLoading: boolean;
  isVoteActionPending: boolean;
  inActionKeys: Record<string, boolean>;
  getItemVoteResult: (key: string) => any;
}

export const createTableColumns = ({
  isPageExpanded,
}: {
  isPageExpanded: boolean;
}): ColumnDef<ITableProposalItem, any>[] => {
  const columnHelper = createColumnHelper<ITableProposalItem>();

  const propertyColumn = columnHelper.accessor('property', {
    id: 'property',
    header: () => (
      <TooltipTh
        title="Property"
        tooltipContext="The property name of the project item"
      />
    ),
    size: isPageExpanded ? 247 : 220,
    cell: (info) => {
      const rowKey = info.row.original.key;
      return (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-[14px] font-[600] leading-[20px] text-black">
            {info.getValue()}
          </div>
          <TooltipItemWeight itemWeight={ESSENTIAL_ITEM_MAP[rowKey].weight} />
        </div>
      );
    },
  });

  // TODO 预留字段，用于显示字段类型
  const fieldTypeColumn = columnHelper.accessor('fieldType', {
    id: 'fieldType',
    header: () => (
      <TooltipTh
        title="Field Type"
        tooltipContext="The type of the field for the project item"
      />
    ),
    size: 220,
    cell: (info) => {
      const key = info.row.original.key;
      const itemConfig = AllItemConfig[key as IEssentialItemKey];
      return (
        <div className="font-mona flex items-center overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
          {itemConfig.formDisplayType}
        </div>
      );
    },
  });

  const inputColumn = columnHelper.accessor('input', {
    header: () => (
      <TooltipTh
        title="Input"
        tooltipContext="The input value provided by the user"
      />
    ),
    size: isPageExpanded ? 480 : 250,
    cell: (info) => {
      const { expandedRows, toggleRowExpanded } = info.table.options
        .meta as TableCellsMeta;
      const value = info.getValue();
      const rowKey = info.row.original.key as IEssentialItemKey;
      const itemConfig = AllItemConfig[rowKey];
      const isExpandable = itemConfig.showExpand;
      const displayFormType = itemConfig.formDisplayType;
      const isRowExpanded = expandedRows[rowKey];

      return (
        <div className="font-mona flex w-full items-center justify-between gap-[10px]">
          <div className="flex-1 overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
            {isExpandable ? (
              isRowExpanded ? (
                'Close'
              ) : (
                'Expand'
              )
            ) : (
              <InputContentRenderer
                value={value}
                displayFormType={displayFormType}
              />
            )}
          </div>

          {isExpandable && (
            <Button
              isIconOnly
              className={cn(
                'size-[24px] shrink-0 opacity-50',
                isRowExpanded ? 'rotate-180' : '',
              )}
              onPress={() => {
                toggleRowExpanded(rowKey);
              }}
            >
              <CaretDownIcon size={18} />
            </Button>
          )}
        </div>
      );
    },
  });

  const referenceColumn = columnHelper.accessor('reference', {
    header: () => (
      <TooltipTh
        title="Reference"
        tooltipContext="Reference information for this property"
      />
    ),
    size: 124,
    cell: (info) => {
      const { onShowReference } = info.table.options.meta as TableCellsMeta;
      const value = info.getValue();
      return (
        <div className="mx-auto flex justify-center">
          {value ? (
            <Button
              color="secondary"
              size="md"
              className="w-[104px] text-[13px] font-[400]"
              onPress={() => onShowReference(info.row.original.key)}
            >
              Reference
            </Button>
          ) : (
            <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
              empty
            </div>
          )}
        </div>
      );
    },
  });

  const supportColumn = columnHelper.accessor('support', {
    header: () => (
      <TooltipTh
        title="Support"
        tooltipContext="Number of supporters for this property"
      />
    ),
    size: 220,
    cell: (info) => {
      const {
        project,
        proposal,
        onVoteAction,
        isFetchVoteInfoLoading,
        isVoteActionPending,
        inActionKeys,
        getItemVoteResult,
      } = info.table.options.meta as TableCellsMeta;

      const key = info.row.original.key;
      const isLoading =
        (isFetchVoteInfoLoading || isVoteActionPending) && inActionKeys[key];
      const {
        itemVotedMemberCount,
        itemPoints,
        itemPointsNeeded,
        isItemReachPointsNeeded,
        isItemReachQuorum,
        isItemValidated,
        isUserVotedInItem,
      } = getItemVoteResult(key);
      return (
        <VoteItem
          fieldKey={key}
          itemPoints={itemPoints}
          itemPointsNeeded={itemPointsNeeded}
          isReachQuorum={isItemReachQuorum}
          isReachPointsNeeded={isItemReachPointsNeeded}
          isValidated={isItemValidated}
          project={project!}
          proposal={proposal!}
          proposalItem={info.row.original}
          isLoading={isLoading}
          isUserVoted={isUserVotedInItem}
          votedMemberCount={itemVotedMemberCount}
          onAction={() => onVoteAction(info.row.original)}
        />
      );
    },
  });

  return [propertyColumn, inputColumn, referenceColumn, supportColumn];
};
