'use client';

import { cn } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { FC, useCallback, useMemo, useState } from 'react';

import {
  formatProjectValue,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from '@/components/biz/table';
import InputContentRenderer from '@/components/biz/table/InputContentRenderer';
import { CaretDownIcon } from '@/components/icons';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import { AllItemConfig } from '@/constants/itemConfig';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';
import { formatDate } from '@/utils/formatters';

import { useDisplayedColumns } from './DisplayedColumns';
import { AccountabilityMetric, TableRowData, Web3Metric } from './types';

interface DisplayedProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
}
const accountabilityMetrics: AccountabilityMetric[] = [
  { name: 'Transparency', isExpanded: false },
  { name: 'Participation', isExpanded: false },
  { name: 'Performance Eval', isExpanded: false },
];

const web3Metrics: Web3Metric[] = [
  { label: 'Privacy:', value: '---' },
  { label: 'Decentralization:', value: '---' },
  { label: 'Security:', value: '---' },
  { label: 'On-Chain Transparency:', value: '---' },
];

const Displayed: FC<DisplayedProps> = ({
  itemName = 'ItemName',
  itemWeight = 22,
  itemKey,
}) => {
  // 获取项目数据
  const { project } = useProjectDetail();

  // 展开行状态管理
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 根据 itemKey 从项目数据中获取真实数据
  const tableData: TableRowData[] = useMemo(() => {
    if (!project || !itemKey) {
      console.log('Displayed: Missing project or itemKey', {
        project: !!project,
        itemKey,
      });
      return [];
    }

    console.log(
      'Displayed: Processing data for itemKey:',
      itemKey,
      'project:',
      project.name,
    );

    // 获取项目中对应 key 的值
    const value = project[itemKey as keyof typeof project];
    const formattedValue = formatProjectValue(itemKey, value);

    // 获取引用信息
    const getReference = (key: string): string => {
      if (!project.refs || !Array.isArray(project.refs)) return '';
      const ref = project.refs.find(
        (r) =>
          typeof r === 'object' && r !== null && 'key' in r && r.key === key,
      ) as { key: string; value: string } | undefined;
      return ref?.value || '';
    };

    // 获取字段配置信息
    const itemConfig = AllItemConfig[itemKey as IEssentialItemKey];
    const weight = itemConfig?.weight || itemWeight;

    return [
      {
        id: '1',
        input: formattedValue,
        key: itemKey,
        reference: getReference(itemKey),
        submitter: {
          name: 'Project Creator',
          date: formatDate(project.createdAt),
        },
        support: {
          count:
            typeof weight === 'number'
              ? weight
              : parseInt(weight?.toString() || '0', 10),
          voters: 1, // 可以根据实际投票数据调整
        },
      },
    ];
  }, [project, itemKey, itemWeight]);

  // 切换行展开状态
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Event handlers
  const handleReferenceClick = useCallback((rowId: string) => {
    console.log('Reference clicked for row:', rowId);
    // TODO: Implement reference modal or action
  }, []);

  const handleExpandClick = useCallback((rowId: string) => {
    console.log('Expand clicked for row:', rowId);
    // TODO: Implement expand/collapse functionality
  }, []);

  // Create columns
  const columns = useDisplayedColumns({
    onReferenceClick: handleReferenceClick,
    onExpandClick: handleExpandClick,
    expandedRows,
    toggleRowExpanded,
  });

  // Create table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Item Info */}
      <div className="flex flex-col gap-[5px] border-b border-black/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="font-mona text-[14px] leading-[1.43] text-black opacity-80">
            Item:
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
            {itemName}
          </span>
          <div className="flex items-center gap-[5px] rounded border border-black/10 bg-black/5 px-2 py-0.5">
            <span className="font-sans text-[14px] font-semibold">Weight:</span>
            <span className="font-sans text-[14px] font-semibold">
              {itemWeight}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
        <table className="w-full border-separate border-spacing-0">
          {/* Table Header */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#F5F5F5]">
                {headerGroup.headers.map((header, index) => (
                  <TableHeader
                    key={header.id}
                    width={
                      header.getSize() === 0 ? undefined : header.getSize()
                    }
                    isLast={index === headerGroup.headers.length - 1}
                    className="h-auto border-b-0 border-l-0 border-r border-black/10 bg-[#F5F5F5] px-2.5 py-4"
                    style={
                      header.getSize() === 0 ? { width: 'auto' } : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHeader>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <TableRow
                  isLastRow={
                    rowIndex === table.getRowModel().rows.length - 1 &&
                    !AllItemConfig[row.original.key as IEssentialItemKey]
                      ?.showExpand
                  }
                  className={cn(
                    expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      width={
                        cell.column.getSize() === 0
                          ? undefined
                          : cell.column.getSize()
                      }
                      isLast={cellIndex === row.getVisibleCells().length - 1}
                      isLastRow={
                        rowIndex === table.getRowModel().rows.length - 1 &&
                        !AllItemConfig[row.original.key as IEssentialItemKey]
                          ?.showExpand
                      }
                      className="border-b-0 border-l-0 border-r border-black/10 px-2.5"
                      minHeight={60}
                      style={
                        cell.column.getSize() === 0
                          ? { width: 'auto' }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {AllItemConfig[row.original.key as IEssentialItemKey]
                  ?.showExpand && (
                  <tr
                    key={`${row.id}-expanded`}
                    className={cn(
                      expandedRows[row.original.key] ? '' : 'hidden',
                    )}
                  >
                    <td
                      colSpan={row.getVisibleCells().length}
                      className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                        rowIndex === table.getRowModel().rows.length - 1
                          ? 'border-b-0'
                          : ''
                      }`}
                    >
                      <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                        <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                          <InputContentRenderer
                            itemKey={row.original.key as IPocItemKey}
                            value={row.original.input}
                            displayFormType={
                              AllItemConfig[
                                row.original.key as IEssentialItemKey
                              ]!.formDisplayType
                            }
                            isEssential={
                              AllItemConfig[
                                row.original.key as IEssentialItemKey
                              ]!.isEssential
                            }
                          />
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Edit Reason Row */}
            <TableFooter colSpan={table.getAllColumns().length}>
              <div className="flex items-center gap-[5px]">
                <span className="font-sans text-[13px] opacity-50">
                  Edit Reason:
                </span>
                <span className="font-sans text-[13px]">
                  provided reason as text here
                </span>
              </div>
            </TableFooter>
          </tbody>
        </table>
      </div>
      {/* Accountability Metrics Section */}
      <div className="flex flex-col gap-5 border-t border-black/10 pt-5">
        {/* Accountability Metrics */}
        <div className="flex flex-col gap-2.5">
          <div className="font-mona text-[16px] font-semibold leading-[1.25em] text-black opacity-80">
            Accountability Metrics:
          </div>
          <div className="font-open-sans text-[13px] font-normal leading-[1.36em] text-black opacity-50">
            This item falls under the following criteria,
          </div>
          <div className="flex flex-col gap-2.5">
            {accountabilityMetrics.map((metric) => (
              <div
                key={metric.name}
                className={cn(
                  'flex items-center justify-between gap-2.5 px-0 py-0',
                  metric.isExpanded && 'bg-[#F5F5F5] px-2.5 py-2',
                )}
              >
                <span className="font-open-sans text-[16px] font-normal leading-[1.6em] text-black">
                  {metric.name}
                </span>
                <div className="flex size-[18px] items-center justify-center opacity-50">
                  <CaretDownIcon size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Web3 Metrics */}
        <div className="flex flex-col gap-2.5 opacity-30">
          <div className="font-mona text-[16px] font-semibold leading-[1.25em] text-black opacity-80">
            Web3 Metrics (coming soon)
          </div>
          <div className="flex flex-col gap-[5px]">
            {web3Metrics.map((metric) => (
              <div
                key={metric.label}
                className={cn(
                  'flex items-center justify-between gap-2.5 px-0 py-0',
                )}
              >
                <span className="font-open-sans text-[14px] font-normal leading-[1.43em] text-black">
                  {metric.label}
                </span>
                <span className="font-open-sans text-[14px] font-semibold leading-[1.36em] text-black">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Displayed;
