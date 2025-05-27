'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import {
  ActionsCol,
  InputCol,
  PropertyCol,
  ReferenceCol,
  SubmitterCol,
} from '@/components/biz/table';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

export interface IProjectDataItem {
  key: string; // 项目属性的键名
  property: string; // 显示的属性名称
  input: any; // 项目属性的值
  reference: string; // 引用信息，基于 IRef.value
  submitter: {
    name: string; // 提交者名称
    date: string; // 提交日期
  };
}

interface UseColumnsProps {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  isPageExpanded?: boolean;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
}

// 定义可展开的行键
const expandableRowKeys = ['tagline', 'mainDescription'];

// 检查行是否可展开
const isRowExpandable = (key: string) => {
  return expandableRowKeys.includes(key);
};

export const useColumns = ({
  expandedRows,
  toggleRowExpanded,
  isPageExpanded = false,
  onOpenModal,
}: UseColumnsProps) => {
  // 创建列定义
  const columnHelper = createColumnHelper<IProjectDataItem>();

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
        const item = info.row.original;

        return (
          <ReferenceCol.Cell
            hasReference={!!info.getValue()}
            onShowReference={() => {
              // TODO: 实现引用显示逻辑
              console.log('Show reference for:', item.key);
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
        return (
          <SubmitterCol.Cell
            item={info.row.original}
            itemConfig={itemConfig!}
            submitter={info.getValue()}
          />
        );
      },
    });

    const actionsColumn = columnHelper.accessor('key', {
      id: 'actions',
      header: () => <ActionsCol.Header />,
      size: 195,
      cell: (info) => {
        const item = info.row.original;
        const itemConfig = AllItemConfig[item.key as IPocItemKey];

        return (
          <ActionsCol.Cell
            item={item}
            itemConfig={itemConfig!}
            onView={(contentType) => {
              // TODO 查看逻辑, 类型优化
              if (onOpenModal) {
                onOpenModal(item.key as IPocItemKey, contentType);
              } else {
                console.log('Menu for item:', item.key);
              }
            }}
            onMenu={() => {
              if (onOpenModal) {
                onOpenModal(item.key as IPocItemKey);
              } else {
                console.log('Menu for item:', item.key);
              }
            }}
          />
        );
      },
    });

    return [
      propertyColumn,
      inputColumn,
      referenceColumn,
      submitterColumn,
      actionsColumn,
    ];
  }, [
    columnHelper,
    expandedRows,
    toggleRowExpanded,
    isPageExpanded,
    onOpenModal,
  ]);
};
