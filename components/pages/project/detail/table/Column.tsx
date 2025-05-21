'use client';

import { Button } from '@heroui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { CaretDownIcon } from '@/components/icons';
import TooltipItemWeight from '@/components/pages/project/proposal/detail/table/TooltipItemWeight';
import TooltipTh from '@/components/pages/project/proposal/detail/table/TooltipTh';
import { ESSENTIAL_ITEM_MAP } from '@/lib/constants';

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
}: UseColumnsProps) => {
  // 创建列定义
  const columnHelper = createColumnHelper<IProjectDataItem>();

  return useMemo(() => {
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
        const rowIsExpandable = isRowExpandable(rowKey);

        return (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center text-[14px] font-[600] leading-[20px] text-black">
              {info.getValue()}
            </div>
            {ESSENTIAL_ITEM_MAP[rowKey]?.weight && (
              <TooltipItemWeight
                itemWeight={ESSENTIAL_ITEM_MAP[rowKey].weight}
              />
            )}
          </div>
        );
      },
    });

    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => (
        <TooltipTh
          title="Input"
          tooltipContext="The input value provided by the user"
        />
      ),
      size: isPageExpanded ? 480 : 250,
      cell: (info) => {
        const value = info.getValue();
        const rowKey = info.row.original.key;
        const rowIsExpandable = isRowExpandable(rowKey);
        const isRowExpanded = expandedRows[rowKey];

        const renderValue = () => {
          if (Array.isArray(value)) {
            return JSON.stringify(value);
          }
          return value;
        };

        return (
          <div
            className="font-mona flex w-full items-center justify-between gap-[10px]"
            style={{ maxWidth: isPageExpanded ? '460px' : '230px' }}
          >
            <div className="flex-1 overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
              {rowIsExpandable
                ? isRowExpanded
                  ? renderValue()
                  : renderValue()
                : renderValue()}
            </div>

            {rowIsExpandable && (
              <Button
                isIconOnly
                className={`size-[24px] shrink-0 opacity-50 ${isRowExpanded ? 'rotate-180' : ''}`}
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
      header: () => (
        <TooltipTh
          title="Reference"
          tooltipContext="Reference information for this property"
        />
      ),
      size: 124,
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="mx-auto flex justify-center">
            {value ? (
              <Button
                color="secondary"
                size="md"
                className="w-[104px] text-[13px] font-[400]"
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

    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => (
        <TooltipTh
          title="Submitter"
          tooltipContext="The person who submitted this item"
        />
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
        <TooltipTh
          title="Actions"
          tooltipContext="Actions you can take on this item"
        />
      ),
      size: 195,
      cell: () => {
        return (
          <div className="flex items-center gap-[10px]">
            <Button
              color="secondary"
              size="sm"
              className="h-[30px] rounded-[5px] border-none bg-[#F0F0F0] text-[13px] font-[400]"
            >
              View
            </Button>
            <Button
              color="secondary"
              isIconOnly
              size="sm"
              className="flex size-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#E6E6E6] opacity-50"
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
};
