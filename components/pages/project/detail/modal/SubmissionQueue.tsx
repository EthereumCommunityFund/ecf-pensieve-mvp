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
  TableHeader,
  TableRow,
} from '@/components/biz/table';
import InputContentRenderer from '@/components/biz/table/InputContentRenderer';
import { CaretUpDownIcon } from '@/components/icons';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import { AllItemConfig } from '@/constants/itemConfig';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';
import { formatDate } from '@/utils/formatters';

import {
  useDisplayedColumns,
  useSubmissionQueueColumns,
} from './SubmissionQueueColumns';
import { TableRowData } from './types';

interface SubmissionQueueProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
}

const SubmissionQueue: FC<SubmissionQueueProps> = ({
  itemName = 'ItemName',
  itemWeight = 22,
  itemKey,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 展开行状态管理
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 获取项目数据
  const { project } = useProjectDetail();

  // 根据 itemKey 从项目数据中获取 Displayed Table 的真实数据
  const displayedTableData: TableRowData[] = useMemo(() => {
    if (!project || !itemKey) {
      console.log('SubmissionQueue Displayed: Missing project or itemKey', {
        project: !!project,
        itemKey,
      });
      return [];
    }

    console.log(
      'SubmissionQueue Displayed: Processing data for itemKey:',
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
        id: 'displayed-1',
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

  // 使用模拟数据创建 submission queue 数据
  const tableData: TableRowData[] = useMemo(() => {
    // 创建模拟的 submission queue 数据
    const mockSubmissionData: TableRowData[] = [
      {
        id: 'submission-1',
        input: 'Mock submission value 1',
        key: itemKey || 'mockKey',
        reference: 'https://example.com/ref1',
        submitter: {
          name: 'Longusern..',
          date: '12/15/2024',
        },
        support: {
          count: 22,
          voters: 3,
        },
      },
      {
        id: 'submission-2',
        input: 'Mock submission value 2',
        key: itemKey || 'mockKey',
        reference: '',
        submitter: {
          name: 'Username',
          date: '12/14/2024',
        },
        support: {
          count: 18,
          voters: 2,
        },
      },
      {
        id: 'submission-3',
        input: 'Mock submission value 3',
        key: itemKey || 'mockKey',
        reference: 'https://example.com/ref3',
        submitter: {
          name: 'AnotherUser',
          date: '12/13/2024',
        },
        support: {
          count: 15,
          voters: 4,
        },
      },
    ];

    return mockSubmissionData;
  }, [itemKey]);

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

  const handleCollapseAll = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    console.log('Collapse all clicked:', !isCollapsed);
  }, [isCollapsed]);

  const handleExpandClick = useCallback((rowId: string) => {
    console.log('Expand clicked for row:', rowId);
    // TODO: Implement expand/collapse functionality
  }, []);

  // Create columns for Displayed Table
  const displayedColumns = useDisplayedColumns({
    onReferenceClick: handleReferenceClick,
    onExpandClick: handleExpandClick,
    expandedRows,
    toggleRowExpanded,
  });

  // Create columns for Submission Queue Table
  const submissionColumns = useSubmissionQueueColumns({
    onReferenceClick: handleReferenceClick,
    onExpandClick: handleExpandClick,
    expandedRows,
    toggleRowExpanded,
  });

  // Create table instances
  const displayedTable = useReactTable({
    data: displayedTableData,
    columns: displayedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Create Submission Queue table instance
  const submissionTable = useReactTable({
    data: tableData,
    columns: submissionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Displayed Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-[5px]">
          <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
            Displayed:
          </span>
          <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
            This is the validated submission currently shown on the project
            page.
          </span>
        </div>

        {/* Displayed Table */}
        <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
          <table className="w-full border-separate border-spacing-0">
            {/* Table Header */}
            <thead>
              {displayedTable.getHeaderGroups().map((headerGroup) => (
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
              {displayedTable.getRowModel().rows.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    isLastRow={
                      rowIndex ===
                        displayedTable.getRowModel().rows.length - 1 &&
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
                          rowIndex ===
                            displayedTable.getRowModel().rows.length - 1 &&
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
                          rowIndex ===
                          displayedTable.getRowModel().rows.length - 1
                            ? 'border-b-0'
                            : ''
                        }`}
                      >
                        <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                          <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                            <InputContentRenderer
                              value={row.original.input}
                              itemKey={row.original.key as IPocItemKey}
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Queue Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-2">
            <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
              Submission Que:
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
              This is the list of submissions available to replace the displayed
              one.
            </span>
          </div>
        </div>

        {/* Collapse All Button */}
        <button
          onClick={handleCollapseAll}
          className="flex items-center gap-[5px] rounded-[5px] bg-black/5 px-2.5 py-[5px] transition-colors hover:bg-black/10"
        >
          <CaretUpDownIcon size={16} className="opacity-80" />
          <span className="font-sans text-[13px] font-semibold text-black opacity-80">
            Collapse All Items
          </span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
        <table className="w-full border-separate border-spacing-0">
          {/* Table Header */}
          <thead>
            {submissionTable.getHeaderGroups().map((headerGroup) => (
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
            {submissionTable.getRowModel().rows.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <TableRow
                  isLastRow={
                    rowIndex ===
                      submissionTable.getRowModel().rows.length - 1 &&
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
                        rowIndex ===
                          submissionTable.getRowModel().rows.length - 1 &&
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
                        rowIndex ===
                        submissionTable.getRowModel().rows.length - 1
                          ? 'border-b-0'
                          : ''
                      }`}
                    >
                      <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                        <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                          <InputContentRenderer
                            value={row.original.input}
                            itemKey={row.original.key as IPocItemKey}
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
          </tbody>
        </table>
      </div>

      {/* Submit Entry Button */}
      <button className="flex w-full items-center justify-center gap-2.5 rounded-[5px] border border-black/10 bg-[#E6E6E6] px-[30px] py-2.5 transition-colors hover:bg-[#D6D6D6]">
        <span className="font-sans text-[14px] font-semibold text-black">
          Submit an Entry
        </span>
      </button>
    </div>
  );
};

export default SubmissionQueue;
