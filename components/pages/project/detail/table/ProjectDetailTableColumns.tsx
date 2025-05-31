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
import { IProfileCreator } from '@/types';
import { IPocItemKey } from '@/types/item';

import { IRef } from '../../create/types';
import { ITableMetaOfProjectDetail } from '../types';

export interface IKeyItemDataForTable {
  key: string;
  property: string;
  input: any;
  reference: IRef | null;
  submitter: IProfileCreator;
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
}

interface IUseProjectTableColumnsProps {
  isPageExpanded?: boolean;
  showMetrics?: boolean;
}

// TODO： 从 itemConfig 取
const expandableRowKeys = ['tagline', 'mainDescription'];

// 检查行是否可展开
const isRowExpandable = (key: string) => {
  return expandableRowKeys.includes(key);
};

export const useProjectTableColumns = ({
  isPageExpanded = false,
  showMetrics = false,
}: IUseProjectTableColumnsProps) => {
  // 创建列定义
  const columnHelper = createColumnHelper<IKeyItemDataForTable>();

  return useMemo(() => {
    const propertyColumn = columnHelper.accessor('property', {
      id: 'property',
      header: () => <PropertyCol.Header />,
      size: isPageExpanded ? 247 : 220,
      cell: (info) => {
        const item = info.row.original;

        return (
          <PropertyCol.Cell itemKey={item.key}>
            {info.getValue()}
          </PropertyCol.Cell>
        );
      },
    });

    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: isPageExpanded ? 480 : 250,
      cell: (info) => {
        const item = info.row.original;
        const { expandedRows, toggleRowExpanded } = info.table.options
          .meta as ITableMetaOfProjectDetail;

        const rowIsExpandable = isRowExpandable(item.key);
        const isRowExpanded = expandedRows[item.key];

        return (
          <InputCol.Cell
            value={info.getValue()}
            itemKey={item.key as any}
            isExpandable={rowIsExpandable}
            isExpanded={isRowExpanded}
            onToggleExpand={
              rowIsExpandable ? () => toggleRowExpanded(item.key) : undefined
            }
          />
        );
      },
    });

    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => <ReferenceCol.Header />,
      size: 124,
      cell: (info) => {
        const reference = info.getValue();
        const key = info.row.original.key;
        const { showReferenceModal } = info.table.options
          .meta as ITableMetaOfProjectDetail;

        return (
          <ReferenceCol.Cell
            hasReference={!!info.getValue()}
            onShowReference={() => {
              showReferenceModal?.(reference?.value || '', key as IPocItemKey);
            }}
          />
        );
      },
    });

    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => <SubmitterCol.Header />,
      size: 183,
      cell: (info) => {
        const item = info.row.original;
        const itemConfig = AllItemConfig[item.key as IPocItemKey];
        const submitterData = info.getValue();
        return (
          <SubmitterCol.Cell
            item={info.row.original}
            itemConfig={itemConfig!}
            submitter={submitterData}
            data={item.createdAt}
          />
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

    const actionsColumn = columnHelper.accessor('key', {
      id: 'actions',
      header: () => <ActionsCol.Header />,
      size: 195,
      cell: (info) => {
        const item = info.row.original;
        const itemConfig = AllItemConfig[item.key as IPocItemKey];
        const { onOpenModal } = info.table.options
          .meta as ITableMetaOfProjectDetail;

        return (
          <ActionsCol.Cell
            item={item}
            itemConfig={itemConfig!}
            onView={(contentType?: 'viewItemProposal' | 'submitPropose') => {
              // TODO 查看逻辑, 类型优化
              if (onOpenModal && contentType) {
                onOpenModal(item.key as IPocItemKey, contentType);
              } else {
                console.log('Menu for item:', item.key);
              }
            }}
          />
        );
      },
    });

    // 基础列
    const baseColumns = [
      propertyColumn,
      inputColumn,
      referenceColumn,
      submitterColumn,
    ];

    // Metrics 列 (条件显示)
    const metricsColumns = showMetrics
      ? [accountabilityColumn, legitimacyColumn]
      : [];

    // Actions 列
    const actionColumns = [actionsColumn];

    return [...baseColumns, ...metricsColumns, ...actionColumns];
  }, [columnHelper, isPageExpanded, showMetrics]);
};
