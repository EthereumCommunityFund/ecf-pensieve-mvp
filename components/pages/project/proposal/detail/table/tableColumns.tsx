'use client';

import { cn } from '@heroui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { memo, useCallback, useMemo } from 'react';

import { Button } from '@/components/base';
import { AccountabilityCol, LegitimacyCol } from '@/components/biz/table';
import { CaretDownIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { ALL_POC_ITEM_MAP } from '@/lib/constants';
import {
  IEssentialItemKey,
  IItemSubCategoryEnum,
  IPocItemKey,
} from '@/types/item';

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
}

// 支持列单元格组件，使用context获取动态数据
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
}: {
  isPageExpanded: boolean;
  isProposalCreator: boolean;
  showMetrics: boolean;
}): ColumnDef<ITableProposalItem, any>[] => {
  const columnHelper = createColumnHelper<ITableProposalItem>();

  const columns = useMemo(() => {
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
            <TooltipItemWeight
              itemWeight={ALL_POC_ITEM_MAP[rowKey as IPocItemKey].weight}
            />
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
            {itemConfig?.formDisplayType}
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
                isRowExpanded={isRowExpanded}
                onToggleExpanded={() => toggleRowExpanded(rowKey)}
              />
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
                onPress={() =>
                  onShowReference(info.row.original.key as IPocItemKey)
                }
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

    const accountabilityColumn = columnHelper.accessor('accountability', {
      id: 'accountability',
      header: () => <AccountabilityCol.Header />,
      size: 228,
      cell: (info) => {
        const accountability = info.getValue();
        return <AccountabilityCol.Cell accountability={accountability} />;
      },
    });

    const legitimacyColumn = columnHelper.accessor('legitimacy', {
      id: 'legitimacy',
      header: () => <LegitimacyCol.Header />,
      size: 228,
      cell: (info) => {
        const legitimacy = info.getValue();
        return <LegitimacyCol.Cell legitimacy={legitimacy} />;
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
  }, [isPageExpanded, showMetrics, columnHelper]);

  return columns;
};
