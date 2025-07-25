'use client';

import { cn } from '@heroui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { memo, useCallback, useMemo } from 'react';

import { Button } from '@/components/base';
import {
  AccountabilityCol,
  LegitimacyCol,
  TooltipThWithPin,
} from '@/components/biz/table';
import { CaretDownIcon } from '@/components/icons';
import SablierEntry from '@/components/sablier/SablierEntry';
import { AllItemConfig } from '@/constants/itemConfig';
import { ALL_POC_ITEM_MAP } from '@/lib/constants';
import {
  IEssentialItemKey,
  IItemSubCategoryEnum,
  IPocItemKey,
} from '@/types/item';
import { isSablierDomain } from '@/utils/sablierDetector';

import { useProposalDetailContext } from '../context/proposalDetailContext';
import { ITableProposalItem } from '../ProposalDetails';

import InputContentRenderer from './InputContentRenderer';
import TooltipItemWeight from './TooltipItemWeight';
import TooltipTh from './TooltipTh';
import VoteItem from './VoteItem';

export interface TableCellsMeta {
  expandedRows: Record<IPocItemKey, boolean>;
  toggleRowExpanded: (key: IPocItemKey) => void;
  onShowReference: (key: IPocItemKey) => void;
  isProposalCreator: boolean;
  toggleMetricsVisible: (subCat: IItemSubCategoryEnum) => void;
  toggleColumnPinning?: (
    category: IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
  isColumnPinned?: (
    category: IItemSubCategoryEnum,
    columnId: string,
  ) => 'left' | 'right' | false;
  category?: IItemSubCategoryEnum;
}

// Support column cell component, uses context to get dynamic data
const SupportCell = memo(
  ({
    rowData,
    isProposalCreator,
  }: {
    rowData: ITableProposalItem;
    isProposalCreator: boolean;
  }) => {
    const { getItemVoteResult, onVoteAction, project, proposal } =
      useProposalDetailContext();

    const key = rowData.key as IPocItemKey;

    const {
      itemVotedMemberCount,
      itemPoints,
      itemPointsNeeded,
      isItemReachPointsNeeded,
      isItemReachQuorum,
      isItemValidated,
      isUserVotedInItem,
    } = getItemVoteResult(key);

    const handleVoteAction = useCallback(() => {
      return onVoteAction(rowData);
    }, [onVoteAction, rowData]);

    return (
      <VoteItem
        fieldKey={key}
        itemPoints={itemPoints}
        itemPointsNeeded={itemPointsNeeded}
        isReachQuorum={isItemReachQuorum}
        isReachPointsNeeded={isItemReachPointsNeeded}
        isValidated={isItemValidated}
        isProposalCreator={isProposalCreator}
        project={project!}
        proposal={proposal!}
        proposalItem={rowData}
        isUserVoted={isUserVotedInItem}
        votedMemberCount={itemVotedMemberCount}
        onAction={handleVoteAction}
      />
    );
  },
);
SupportCell.displayName = 'SupportCell';

export const useCreateProposalTableColumns = ({
  isPageExpanded,
  isProposalCreator,
  showMetrics,
  category,
  columnPinning,
}: {
  isPageExpanded: boolean;
  isProposalCreator: boolean;
  showMetrics: boolean;
  category: IItemSubCategoryEnum;
  columnPinning?: import('@tanstack/react-table').ColumnPinningState;
}): ColumnDef<ITableProposalItem, any>[] => {
  // Use useMemo to avoid recreating columnHelper on every render
  const columnHelper = useMemo(
    () => createColumnHelper<ITableProposalItem>(),
    [],
  );

  const columns = useMemo(() => {
    const propertyColumn = columnHelper.accessor('property', {
      id: 'property',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as TableCellsMeta;

        // If column pinning is supported, use TooltipThWithPin
        if (toggleColumnPinning && isColumnPinned && category) {
          return (
            <TooltipThWithPin
              title="Property"
              tooltipContext="The property name of the project item"
              columnId="property"
              category={category}
              isPinned={isColumnPinned(category, 'property')}
              onTogglePin={toggleColumnPinning}
            />
          );
        }

        // Fallback to regular TooltipTh
        return (
          <TooltipTh
            title="Property"
            tooltipContext="The property name of the project item"
          />
        );
      },
      size: 240,
      minSize: 240,
      maxSize: 240,
      enableResizing: false,
      cell: (info) => {
        const rowKey = info.row.original.key;
        return (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center text-[14px] font-[600] leading-[20px] text-black">
              {info.getValue()}
            </div>
            <TooltipItemWeight
              itemWeight={ALL_POC_ITEM_MAP[rowKey as IPocItemKey].weight}
              isGenesis={true}
            />
          </div>
        );
      },
    });

    const inputColumn = columnHelper.accessor('input', {
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as TableCellsMeta;

        // If column pinning is supported, use TooltipThWithPin
        if (toggleColumnPinning && isColumnPinned && category) {
          return (
            <TooltipThWithPin
              title="Input"
              tooltipContext="The input value provided by the user"
              columnId="input"
              category={category}
              isPinned={isColumnPinned(category, 'input')}
              onTogglePin={toggleColumnPinning}
            />
          );
        }

        // Fallback to regular TooltipTh
        return (
          <TooltipTh
            title="Input"
            tooltipContext="The input value provided by the user"
          />
        );
      },
      size: 240,
      minSize: 200,
      enableResizing: true,
      cell: (info) => {
        const { expandedRows, toggleRowExpanded } = info.table.options
          .meta as TableCellsMeta;
        const value = info.getValue();
        const rowKey = info.row.original.key as IEssentialItemKey;
        const itemConfig = AllItemConfig[rowKey]!;
        const isExpandable = itemConfig.showExpand;
        const displayFormType = itemConfig.formDisplayType;
        const isRowExpanded = expandedRows[rowKey];

        return (
          <div className="font-mona flex w-full items-center justify-between gap-[10px]">
            <div className="flex-1 overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
              <InputContentRenderer
                itemKey={rowKey as IPocItemKey}
                value={value}
                displayFormType={displayFormType}
                isEssential={itemConfig.isEssential}
                isExpandable={isExpandable}
                isExpanded={expandedRows[rowKey]}
                onToggleExpanded={() => toggleRowExpanded(rowKey)}
              />
            </div>

            {isExpandable && (
              <Button
                isIconOnly
                className={cn(
                  'size-[24px] shrink-0 opacity-50 transition-transform duration-200',
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
      id: 'reference',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as TableCellsMeta;

        // If column pinning is supported, use TooltipThWithPin
        if (toggleColumnPinning && isColumnPinned && category) {
          return (
            <TooltipThWithPin
              title="Reference"
              tooltipContext="Reference information for this property"
              columnId="reference"
              category={category}
              isPinned={isColumnPinned(category, 'reference')}
              onTogglePin={toggleColumnPinning}
            />
          );
        }

        // Fallback to regular TooltipTh
        return (
          <TooltipTh
            title="Reference"
            tooltipContext="Reference information for this property"
          />
        );
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
      enableResizing: true,
      cell: (info) => {
        const { onShowReference } = info.table.options.meta as TableCellsMeta;
        const value = info.getValue();
        const isMatchSablier = isSablierDomain(value);

        return (
          <div className="mx-auto flex w-full justify-center">
            {value ? (
              <div className="flex flex-col items-center gap-[10px]">
                {isMatchSablier && <SablierEntry />}
                <Button
                  color="secondary"
                  size="md"
                  className="w-[104px] text-[13px] font-[400]"
                  onPress={() =>
                    onShowReference(info.row.original.key as IPocItemKey)
                  }
                >
                  Reference
                </Button>
              </div>
            ) : (
              <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
                empty
              </div>
            )}
          </div>
        );
      },
    });

    const accountabilityColumn = columnHelper.accessor('accountability', {
      id: 'accountability',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as TableCellsMeta;
        return (
          <AccountabilityCol.Header
            columnId="accountability"
            category={category}
            isPinned={
              category && isColumnPinned
                ? isColumnPinned(category, 'accountability')
                : false
            }
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 200,
      minSize: 180,
      maxSize: 230,
      enableResizing: true,
      cell: (info) => {
        const accountability = info.getValue();
        return <AccountabilityCol.Cell accountability={accountability} />;
      },
    });

    const legitimacyColumn = columnHelper.accessor('legitimacy', {
      id: 'legitimacy',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as TableCellsMeta;
        return (
          <LegitimacyCol.Header
            columnId="legitimacy"
            category={category}
            isPinned={
              category && isColumnPinned
                ? isColumnPinned(category, 'legitimacy')
                : false
            }
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 200,
      minSize: 180,
      maxSize: 230,
      enableResizing: true,
      cell: (info) => {
        const legitimacy = info.getValue();
        return <LegitimacyCol.Cell legitimacy={legitimacy} />;
      },
    });

    const supportColumn = columnHelper.accessor('support', {
      id: 'support',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as TableCellsMeta;

        // If column pinning is supported, use TooltipThWithPin
        if (toggleColumnPinning && isColumnPinned && category) {
          return (
            <TooltipThWithPin
              title="Support"
              tooltipContext="Amount of Contribution Points and number of supporters"
              columnId="support"
              category={category}
              isPinned={isColumnPinned(category, 'support')}
              onTogglePin={toggleColumnPinning}
            />
          );
        }

        // Fallback to regular TooltipTh
        return (
          <TooltipTh
            title="Support"
            tooltipContext="Number of supporters for this property"
          />
        );
      },
      size: 160,
      minSize: 140,
      maxSize: 200,
      enableResizing: true,
      cell: (info) => {
        const { isProposalCreator } = info.table.options.meta as TableCellsMeta;

        return (
          <SupportCell
            rowData={info.row.original}
            isProposalCreator={isProposalCreator}
          />
        );
      },
    });

    const metricsColumns = showMetrics
      ? [accountabilityColumn, legitimacyColumn]
      : [];

    return [
      propertyColumn,
      inputColumn,
      referenceColumn,
      ...metricsColumns,
      supportColumn,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMetrics, category]);

  return columns;
};
