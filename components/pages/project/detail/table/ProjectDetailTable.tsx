'use client';

import { Button, cn, Skeleton } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useCallback, useMemo, useState } from 'react';

import { CaretUpIcon } from '@/components/icons';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import {
  IProjectDataItem,
  useColumns,
} from '@/components/pages/project/detail/table/Column';
import { IProject } from '@/types';
import { formatDate } from '@/utils/formatters';

interface ProjectDataProps {
  projectId: number;
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;
  onSubmitProposal: () => void;
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
    const result: IProjectDataItem[] = Object.keys(project).map((key) => {
      // 获取项目属性值
      const value = project[key as keyof IProject];

      // 格式化值为字符串
      let formattedValue: any = value;

      // 处理不同类型的值
      if (value === null || value === undefined) {
        formattedValue = '';
      } else if (value instanceof Date) {
        formattedValue = formatDate(value);
      } else if (Array.isArray(value)) {
        formattedValue = value.join(', ');
      } else if (typeof value === 'object') {
        formattedValue = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        formattedValue = value ? 'Yes' : 'No';
      }

      return {
        key,
        property: key,
        input: formattedValue,
        reference: getReference(key),
        submitter: {
          name: 'Username',
          date: formatDate(project.createdAt),
        },
      };
    });
    // const result: IProjectDataItem[] = [
    //   {
    //     key: 'projectName',
    //     property: 'Project Name',
    //     input: project.name,
    //     reference: getReference('projectName'),
    //     submitter: {
    //       name: 'Username',
    //       date: formatDate(project.createdAt),
    //     },
    //   },
    //   {
    //     key: 'tagline',
    //     property: 'Tagline',
    //     input: project.tagline,
    //     reference: getReference('tagline'),
    //     submitter: {
    //       name: 'Username',
    //       date: formatDate(project.createdAt),
    //     },
    //   },
    //   {
    //     key: 'dateFounded',
    //     property: 'Product Launch Date',
    //     input: formatDate(project.dateFounded),
    //     reference: getReference('dateFounded'),
    //     submitter: {
    //       name: 'Username',
    //       date: formatDate(project.createdAt),
    //     },
    //   },
    //   {
    //     key: 'mainDescription',
    //     property: 'Main Description',
    //     input: project.mainDescription,
    //     reference: getReference('mainDescription'),
    //     submitter: {
    //       name: 'Username',
    //       date: formatDate(project.createdAt),
    //     },
    //   },
    // ];

    return result;
  }, [project]);

  // 使用抽离出来的 columns
  const columns = useColumns({
    expandedRows,
    toggleRowExpanded,
    isPageExpanded: false,
  });

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
