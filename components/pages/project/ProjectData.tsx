'use client';

import { Button, cn, Skeleton, Tooltip } from '@heroui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useCallback, useMemo, useState } from 'react';

import { CaretDownIcon, CaretUpIcon } from '@/components/icons';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import { IProposal } from '@/types';
import { formatDate } from '@/utils/formatters';

interface ProjectDataProps {
  projectId: number;
  proposals?: IProposal[];
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;
  onSubmitProposal: () => void;
}

interface IProjectDataItem {
  key: string;
  property: string;
  input: string;
  reference: string;
  submitter: {
    name: string;
    date: string;
  };
}

const ProjectData: FC<ProjectDataProps> = ({ isProposalsLoading }) => {
  const { project } = useProjectDetail();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 切换行展开状态
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // 创建表格数据
  const tableData = useMemo(() => {
    if (!project) return [];

    // 类型定义，确保 refs 中的项目有正确的类型
    type ProjectRef = { key: string; value: string };

    // 获取引用的辅助函数
    const getReference = (key: string): string => {
      if (!project.refs || !Array.isArray(project.refs)) return '';
      const ref = project.refs.find(
        (r) =>
          typeof r === 'object' && r !== null && 'key' in r && r.key === key,
      ) as ProjectRef | undefined;
      return ref?.value || '';
    };

    const result: IProjectDataItem[] = [
      {
        key: 'projectName',
        property: 'Project Name',
        input: project.name,
        reference: getReference('projectName'),
        submitter: {
          name: 'Username',
          date: formatDate(project.createdAt),
        },
      },
      {
        key: 'tagline',
        property: 'Tagline',
        input: project.tagline,
        reference: getReference('tagline'),
        submitter: {
          name: 'Username',
          date: formatDate(project.createdAt),
        },
      },
      {
        key: 'dateFounded',
        property: 'Product Launch Date',
        input: formatDate(project.dateFounded),
        reference: getReference('dateFounded'),
        submitter: {
          name: 'Username',
          date: formatDate(project.createdAt),
        },
      },
      {
        key: 'mainDescription',
        property: 'Main Description',
        input: project.mainDescription,
        reference: getReference('mainDescription'),
        submitter: {
          name: 'Username',
          date: formatDate(project.createdAt),
        },
      },
    ];

    return result;
  }, [project]);

  // 创建列定义
  const columnHelper = createColumnHelper<IProjectDataItem>();
  const columns = useMemo(() => {
    const propertyColumn = columnHelper.accessor('property', {
      id: 'property',
      header: () => (
        <div className="flex items-center justify-start gap-[5px]">
          <div>Property</div>
          <Tooltip
            content="The property name of the project item"
            classNames={{
              content: 'p-[10px] rounded-[5px] border border-black/10',
            }}
          >
            <div className="flex size-5 items-center justify-center rounded-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                opacity="0.4"
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10.6667V8"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5.33337H8.00667"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
      ),
      size: 226,
      cell: (info) => {
        const rowKey = info.row.original.key;
        const isExpandable = rowKey === 'tagline';

        return (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center text-[14px] font-[600] leading-[20px] text-black">
              {info.getValue()}
            </div>
            {isExpandable && (
              <div
                className="flex cursor-pointer items-center opacity-70 hover:opacity-100"
                onClick={() => toggleRowExpanded(rowKey)}
              >
                <span className="mr-1 text-[13px] font-[600]">
                  {expandedRows[rowKey] ? 'Collapse' : 'Expand'}
                </span>
                {expandedRows[rowKey] ? (
                  <CaretUpIcon size={16} />
                ) : (
                  <CaretDownIcon size={16} />
                )}
              </div>
            )}
          </div>
        );
      },
    });

    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => (
        <div className="flex items-center justify-start gap-[5px]">
          <div>Input</div>
          <Tooltip
            content="The input value of the project item"
            classNames={{
              content: 'p-[10px] rounded-[5px] border border-black/10',
            }}
          >
            <div className="flex size-5 items-center justify-center rounded-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                opacity="0.4"
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10.6667V8"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5.33337H8.00667"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
      ),
      size: 0,
      cell: (info) => (
        <div className="text-[13px] font-[400] leading-[19px] text-black">
          {info.getValue()}
        </div>
      ),
    });

    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => (
        <div className="flex items-center justify-start gap-[5px]">
          <div>Reference</div>
          <Tooltip
            content="The reference for this project item"
            classNames={{
              content: 'p-[10px] rounded-[5px] border border-black/10',
            }}
          >
            <div className="flex size-5 items-center justify-center rounded-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                opacity="0.4"
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10.6667V8"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5.33337H8.00667"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
      ),
      size: 124,
      cell: () => {
        return (
          <Button
            color="secondary"
            className="h-[39px] w-full rounded-[5px] border border-black/10 bg-[#E6E6E6] px-[30px] py-[10px] text-[13px] font-[400]"
          >
            Reference
          </Button>
        );
      },
    });

    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => (
        <div className="flex items-center justify-start gap-[5px]">
          <div>Submitter</div>
          <Tooltip
            content="The person who submitted this item"
            classNames={{
              content: 'p-[10px] rounded-[5px] border border-black/10',
            }}
          >
            <div className="flex size-5 items-center justify-center rounded-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                opacity="0.4"
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10.6667V8"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5.33337H8.00667"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
      ),
      size: 183,
      cell: (info) => {
        const submitter = info.getValue();
        return (
          <div className="flex items-center gap-[5px]">
            <div className="size-[24px] rounded-full bg-[#D9D9D9]"></div>
            <div className="flex flex-col">
              <span className="text-[14px] font-[400] leading-[20px] text-black">
                {submitter.name}
              </span>
              <span className="text-[12px] font-[600] leading-[12px] text-black opacity-60">
                {submitter.date}
              </span>
            </div>
          </div>
        );
      },
    });

    const actionsColumn = columnHelper.accessor('key', {
      id: 'actions',
      header: () => (
        <div className="flex items-center justify-start gap-[5px]">
          <div>Actions</div>
          <Tooltip
            content="Actions you can take on this item"
            classNames={{
              content: 'p-[10px] rounded-[5px] border border-black/10',
            }}
          >
            <div className="flex size-5 items-center justify-center rounded-full">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                opacity="0.4"
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10.6667V8"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5.33337H8.00667"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
      ),
      size: 195,
      cell: () => {
        return (
          <div className="flex items-center gap-[10px]">
            <Button
              color="secondary"
              className="h-[30px] rounded-[5px] border-none bg-[#F0F0F0] p-[10px] text-[13px] font-[400]"
            >
              View
            </Button>
            <Button
              color="secondary"
              className="flex size-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#E6E6E6] p-[10px] opacity-50"
              isIconOnly
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6667 5.83333H3.33333"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6667 10H3.33333"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6667 14.1667H3.33333"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
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
  }, [columnHelper, expandedRows, toggleRowExpanded]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 渲染表格
  const renderTable = () => {
    const showSkeleton = isProposalsLoading || !project;

    const tableHeaders = (
      <thead>
        <tr className="bg-[#F5F5F5]">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header, index) => (
              <th
                key={header.id}
                style={{
                  width: `${header.getSize()}px`,
                  boxSizing: 'border-box',
                }}
                className={`h-[30px] border-b border-r border-black/10 px-[10px] text-left
                  text-[14px] font-[600] text-black/60
                  ${index === headerGroup.headers.length - 1 ? 'border-r-0' : ''}
                `}
              >
                <div
                  className="flex items-center"
                  style={{ width: '100%', overflow: 'hidden' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </div>
              </th>
            )),
          )}
        </tr>
      </thead>
    );

    if (showSkeleton) {
      return (
        <div className="overflow-hidden overflow-x-auto rounded-b-[10px] border border-t-0 border-black/10">
          <table className="box-border w-full table-fixed border-separate border-spacing-0">
            {tableHeaders}
            <tbody>
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <tr key={`skeleton-row-${rowIndex}`}>
                  {table.getAllColumns().map((column, cellIndex) => (
                    <td
                      key={`skeleton-cell-${column.id}-${rowIndex}`}
                      style={{
                        width: `${column.getSize()}px`,
                        boxSizing: 'border-box',
                      }}
                      className={`border-b border-r
                        border-black/10
                        ${cellIndex === table.getAllColumns().length - 1 ? 'border-r-0' : ''}
                        ${rowIndex === 3 ? 'border-b-0' : ''}
                      `}
                    >
                      <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                        <Skeleton className="h-[20px] w-full rounded" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-hidden overflow-x-auto rounded-b-[10px] border border-t-0 border-black/10">
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          {tableHeaders}
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <td
                    key={cell.id}
                    style={{
                      width: `${cell.column.getSize()}px`,
                      boxSizing: 'border-box',
                    }}
                    className={cn(
                      'border-b border-r border-black/10 hover:bg-[#EBEBEB]',
                      cellIndex === row.getVisibleCells().length - 1
                        ? 'border-r-0'
                        : '',
                      rowIndex === table.getRowModel().rows.length - 1
                        ? 'border-b-0'
                        : '',
                    )}
                  >
                    <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="border-t border-black/10 bg-[#EBEBEB] px-[30px] py-[10px] text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-[600] leading-[20px] text-black/60">
                    Footer
                  </span>
                  <span className="opacity-50">
                    <CaretUpIcon size={16} />
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'mt-[20px] px-[160px] tablet:px-[10px] mobile:px-[10px] pt-[20px] ',
        'flex items-start justify-center gap-[40px] ',
        'tablet:flex-col mobile:flex-col tablet:gap-[20px] mobile:gap-[20px]',
      )}
    >
      <div className="w-full max-w-[1000px]">
        <div className="mb-[20px] flex flex-col gap-[10px]">
          <h2 className="text-[24px] font-[700] leading-[33px] text-black/80">
            Project Overview
          </h2>
          <p className="text-[16px] font-[600] leading-[22px] text-black/40">
            This section displays items that describe the organization's
            contributors, structure..
          </p>
        </div>

        <div className="rounded-[10px] border border-black/10 bg-white">
          {/* 表格头部 */}
          <div className="flex items-center justify-between border-b border-black/10 bg-[rgba(229,229,229,0.7)] p-[10px]">
            <div className="flex flex-col gap-[5px]">
              <h3 className="text-[18px] font-[700] leading-[25px] text-black/80">
                Project Profile
              </h3>
              <p className="text-[14px] font-[400] leading-[19px] text-black/40">
                This section displays items that describe the organization's...
              </p>
            </div>
            <div className="flex items-center gap-[10px]">
              <Button
                color="secondary"
                className="flex h-auto items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[10px] py-[5px] text-[13px] font-[600]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 10L8 6L12 10"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Collapse All
              </Button>
              <Button
                color="secondary"
                className="flex h-auto items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[10px] py-[5px] text-[13px] font-[600]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 4.66667H2.66666"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 8H2.66666"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 11.3333H2.66666"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Metrics
              </Button>
              <Button
                color="secondary"
                className="flex h-auto items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[10px] py-[5px] text-[13px] font-[600]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.66666 2.66667H2.66666V8.66667H8.66666V2.66667Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 2.66667H10.6667V5.33334H13.3333V2.66667Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 7.33333H10.6667V10H13.3333V7.33333Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.6667 12H2.66666V13.3333H10.6667V12Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 12H12V13.3333H13.3333V12Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* 表格内容 */}
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
