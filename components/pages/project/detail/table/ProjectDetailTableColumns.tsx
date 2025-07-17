'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import {
  AccountabilityCol,
  ActionsCol,
  InputCol,
  LegitimacyCol,
  PropertyCol,
  ReferenceCol,
  SubmitterCol,
} from '@/components/biz/table';
import { AllItemConfig } from '@/constants/itemConfig';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { isSablierDomain } from '@/utils/sablierDetector';

import { IRef } from '../../create/types';
import { IProposalCreator, ITableMetaOfProjectDetail } from '../types';

export interface IKeyItemDataForTable {
  key: string;
  property: string;
  input: any;
  reference: IRef | null;
  submitter: IProposalCreator;
  createdAt: Date;
  projectId: number;
  proposalId: number;
  itemTopWeight: number;
  reason?: string;
  // Group information for visual grouping
  group?: string;
  groupTitle?: string;
  /**
   * 原来是 leading proposal, 但现在不再是 leading proposal
   * 但投票用户 switch 了 proposal,导致当前item weight < itemTopWeight
   * 但又还没有新的 leading proposal 出现
   */
  isNotLeading?: boolean;
  // Accountability metrics from item config
  accountability?: string[];
  // Legitimacy metrics from item config
  legitimacy?: string[];
  // Metrics data for table columns
  accountabilityMetrics?: string[];
  legitimacyMetrics?: string[];
  // not essential item, no proposal yet, value is empty, so can propose
  canBePropose: boolean;
  // Was leading proposal, but now backend field isNotLeading is true (because itemWeight < itemTopWeight)
  isConsensusInProgress: boolean;
  // Has proposal, but no validated leading proposal yet
  isPendingValidation: boolean;
  isEmptyItem?: boolean;
}

interface IUseProjectTableColumnsProps {
  isPageExpanded?: boolean;
  showMetrics?: boolean;
  category?: IItemSubCategoryEnum;
}

export const useProjectTableColumns = ({
  isPageExpanded = false,
  showMetrics = false,
  category,
}: IUseProjectTableColumnsProps) => {
  // Create column helper - use useMemo to avoid recreating on every render
  const columnHelper = useMemo(
    () => createColumnHelper<IKeyItemDataForTable>(),
    [],
  );

  return useMemo(() => {
    const propertyColumn = columnHelper.accessor('property', {
      id: 'property',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <PropertyCol.Header
            columnId="property"
            category={category}
            isPinned={category ? isColumnPinned?.(category, 'property') : false}
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 230,
      minSize: 230,
      maxSize: 230,
      enableResizing: false,
      cell: (info) => {
        const { key } = info.row.original;

        return (
          <PropertyCol.Cell itemKey={key} rowData={info.row.original}>
            {info.getValue()}
          </PropertyCol.Cell>
        );
      },
    });

    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <InputCol.Header
            columnId="input"
            category={category}
            isPinned={category ? isColumnPinned?.(category, 'input') : false}
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 280,
      minSize: 200,
      cell: (info) => {
        const item = info.row.original;
        const { expandedRows, toggleRowExpanded, onOpenModal } = info.table
          .options.meta as ITableMetaOfProjectDetail;

        const rowIsExpandable =
          !!AllItemConfig[item.key as IPocItemKey]?.showExpand;
        const isRowExpanded = expandedRows[item.key];

        return (
          <InputCol.Cell
            value={info.getValue()}
            item={item}
            itemKey={item.key as any}
            isExpandable={rowIsExpandable}
            isExpanded={isRowExpanded}
            onToggleExpand={
              rowIsExpandable ? () => toggleRowExpanded(item.key) : undefined
            }
            onPropose={() => {
              onOpenModal?.(item.key as IPocItemKey, 'submitPropose');
            }}
            onViewProposals={() => {
              onOpenModal?.(item.key as IPocItemKey, 'viewItemProposal');
            }}
          />
        );
      },
    });

    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <ReferenceCol.Header
            columnId="reference"
            category={category}
            isPinned={
              category ? isColumnPinned?.(category, 'reference') : false
            }
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 110,
      minSize: 110,
      maxSize: 110,
      enableResizing: false,
      cell: (info) => {
        const reference = info.getValue();
        const key = info.row.original.key;
        const { showReferenceModal } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        const isMatchSablier = isSablierDomain(reference?.value || '');

        return (
          <ReferenceCol.Cell
            hasReference={!!info.getValue()}
            isMatchSablier={isMatchSablier}
            onShowReference={() => {
              showReferenceModal?.(
                reference?.value || '',
                key as IPocItemKey,
                info.row.original.reason || '',
              );
            }}
          />
        );
      },
    });

    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <SubmitterCol.Header
            columnId="submitter"
            category={category}
            isPinned={
              category ? isColumnPinned?.(category, 'submitter') : false
            }
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 140,
      minSize: 140,
      maxSize: 140,
      enableResizing: false,
      cell: (info) => {
        const item = info.row.original;
        const itemConfig = AllItemConfig[item.key as IPocItemKey];
        const submitterData = info.getValue();
        const { showSubmitterModal } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <SubmitterCol.Cell
            item={info.row.original}
            itemConfig={itemConfig!}
            submitter={submitterData}
            data={item.createdAt}
            showSubmitterModal={showSubmitterModal}
          />
        );
      },
    });

    const accountabilityColumn = columnHelper.accessor('accountability', {
      id: 'accountability',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <AccountabilityCol.Header
            columnId="accountability"
            category={category}
            isPinned={
              category ? isColumnPinned?.(category, 'accountability') : false
            }
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 250,
      minSize: 250,
      maxSize: 250,
      enableResizing: false,
      cell: (info) => {
        const accountability = info.getValue();
        const { onMetricClick } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <AccountabilityCol.Cell
            accountability={accountability}
            onMetricClick={onMetricClick}
          />
        );
      },
    });

    const legitimacyColumn = columnHelper.accessor('legitimacy', {
      id: 'legitimacy',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <LegitimacyCol.Header
            columnId="legitimacy"
            category={category}
            isPinned={
              category ? isColumnPinned?.(category, 'legitimacy') : false
            }
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 250,
      minSize: 250,
      maxSize: 250,
      enableResizing: false,
      cell: (info) => {
        const legitimacy = info.getValue();
        const { onMetricClick } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <LegitimacyCol.Cell
            legitimacy={legitimacy}
            onMetricClick={onMetricClick}
          />
        );
      },
    });

    const actionsColumn = columnHelper.accessor('key', {
      id: 'actions',
      header: (info) => {
        const { toggleColumnPinning, isColumnPinned } = info.table.options
          .meta as ITableMetaOfProjectDetail;
        return (
          <ActionsCol.Header
            columnId="actions"
            category={category}
            isPinned={category ? isColumnPinned?.(category, 'actions') : false}
            onTogglePin={toggleColumnPinning}
          />
        );
      },
      size: 120,
      minSize: 120,
      maxSize: 120,
      enableResizing: false,
      cell: (info) => {
        const item = info.row.original;
        const { onOpenModal } = info.table.options
          .meta as ITableMetaOfProjectDetail;

        return (
          <ActionsCol.Cell
            item={item}
            onView={(contentType?: 'viewItemProposal' | 'submitPropose') => {
              onOpenModal?.(
                item.key as IPocItemKey,
                contentType || 'viewItemProposal',
              );
            }}
          />
        );
      },
    });

    // Base columns
    const baseColumns = [
      propertyColumn,
      inputColumn,
      referenceColumn,
      submitterColumn,
    ];

    // Metrics columns (conditionally displayed)
    const metricsColumns = showMetrics
      ? [accountabilityColumn, legitimacyColumn]
      : [];

    // Actions columns
    const actionColumns = [actionsColumn];

    const finalColumns = [...baseColumns, ...metricsColumns, ...actionColumns];

    return finalColumns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMetrics, category]);
};
