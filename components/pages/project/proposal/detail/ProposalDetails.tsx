'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base';
import ECFTypography from '@/components/base/typography';
import {
  basicsFieldsConfig,
  datesFieldsConfig,
  organizationFieldsConfig,
  technicalsFieldsConfig,
} from '@/components/pages/project/create/FormData';
import {
  CreateProjectStep,
  stepFields,
} from '@/components/pages/project/create/types';
import { IProposal } from '@/types';

import { CollapseButton, FilterButton, MetricButton } from './ActionButtons';
import ActionSectionHeader from './ActionSectionHeader';
import TableSectionHeader from './TableSectionHeader';

interface ProposalItem {
  property: string;
  input: string;
  reference: string;
  support: number;
}

type CategoryKey = CreateProjectStep;

const CATEGORIES: Record<
  CreateProjectStep,
  {
    title: string;
    description: string;
    items: string[];
  }
> = {
  [CreateProjectStep.Basics]: {
    title: 'Basics',
    description: '',
    items: [...stepFields[CreateProjectStep.Basics]],
  },
  [CreateProjectStep.Dates]: {
    title: 'Dates & Statuses',
    description: '',
    items: [...stepFields[CreateProjectStep.Dates]],
  },
  [CreateProjectStep.Technicals]: {
    title: 'Technicals',
    description: '',
    items: [...stepFields[CreateProjectStep.Technicals]],
  },
  [CreateProjectStep.Organization]: {
    title: 'Organization',
    description: '',
    items: [...stepFields[CreateProjectStep.Organization]],
  },
};

const FIELD_LABELS: Record<string, string> = {
  ...Object.entries(basicsFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
  ...Object.entries(datesFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
  ...Object.entries(technicalsFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
  ...Object.entries(organizationFieldsConfig).reduce(
    (acc, [key, config]) => {
      acc[key] = config.label;
      return acc;
    },
    {} as Record<string, string>,
  ),
};

interface ProposalDetailsProps {
  proposal?: IProposal;
  projectId: number;
}

const ProposalDetails = ({ proposal, projectId }: ProposalDetailsProps) => {
  const [isPageExpanded, setIsPageExpanded] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const [expanded, setExpanded] = useState<Record<CategoryKey, boolean>>({
    [CreateProjectStep.Basics]: true,
    [CreateProjectStep.Dates]: true,
    [CreateProjectStep.Technicals]: true,
    [CreateProjectStep.Organization]: true,
  });

  const columnHelper = createColumnHelper<ProposalItem>();

  const columns = [
    columnHelper.accessor('property', {
      header: 'Property',
      cell: (info) => (
        <div className="py-[10px]">
          <span className="text-[14px] font-[600] leading-[20px] text-black">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('input', {
      header: 'Input',
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="py-[10px]">
            <div className="flex items-center gap-[5px]">
              <span className="text-[14px] font-[400] leading-[20px] text-black">
                {value}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('reference', {
      header: 'Reference',
      cell: (info) => {
        const value = info.getValue();
        return value ? (
          <div className="py-[10px]">
            <Button
              color="secondary"
              size="sm"
              className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px] text-[14px] font-[400] leading-[20px] text-black"
            >
              Reference
            </Button>
          </div>
        ) : (
          <div className="py-[10px]">
            <span className="text-[14px] font-[400] leading-[20px] text-black/30">
              empty
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('support', {
      header: 'Support',
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="py-[10px]">
            <div className="flex items-center gap-[5px]">
              <Button
                color="secondary"
                size="sm"
                className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L12 20"
                    stroke="#28C196"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 11L12 4L5 11"
                    stroke="#28C196"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <span className="text-[14px] font-[400] leading-[20px] text-black">
                {value}
              </span>
            </div>
          </div>
        );
      },
    }),
  ];

  const tableData = useMemo(() => {
    const result: Record<CategoryKey, ProposalItem[]> = {
      [CreateProjectStep.Basics]: [],
      [CreateProjectStep.Dates]: [],
      [CreateProjectStep.Technicals]: [],
      [CreateProjectStep.Organization]: [],
    };

    proposal?.items.forEach((item: any) => {
      const key = item.key;
      const value = item.value;

      let category: CategoryKey | null = null;
      for (const catKey of Object.values(CreateProjectStep)) {
        if (CATEGORIES[catKey as CategoryKey].items.includes(key)) {
          category = catKey as CategoryKey;
          break;
        }
      }

      if (category) {
        const reference = (
          proposal.refs as Array<{
            key: string;
            value: string;
          }>
        )?.find((ref) => ref.key === key);

        result[category].push({
          property: FIELD_LABELS[key] || key,
          input: value,
          reference: reference ? reference.value : '',
          support: 0,
        });
      }
    });

    return result;
  }, [proposal]);

  const basicsTable = useReactTable<ProposalItem>({
    data: tableData[CreateProjectStep.Basics],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const datesTable = useReactTable<ProposalItem>({
    data: tableData[CreateProjectStep.Dates],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const technicalsTable = useReactTable<ProposalItem>({
    data: tableData[CreateProjectStep.Technicals],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const organizationTable = useReactTable<ProposalItem>({
    data: tableData[CreateProjectStep.Organization],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleCategory = (category: CategoryKey) => {
    setExpanded((prev) => {
      // 创建一个新对象，避免直接修改 prev
      const newExpanded = { ...prev };
      // 切换指定类别的展开状态
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  };

  const getAnimationStyle = (isExpanded: boolean) => ({
    height: isExpanded ? 'auto' : '0',
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
    transition: 'opacity 0.2s ease',
    transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
    transformOrigin: 'top',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.2s',
  });

  const renderTable = (table: any) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-black/10">
            {table.getHeaderGroups().map((headerGroup: any) =>
              headerGroup.headers.map((header: any) => (
                <th
                  key={header.id}
                  className="px-[20px] py-[10px] text-left text-[14px] font-[600] text-black/60"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row: any) => (
            <tr
              key={row.id}
              className="border-b border-black/10 last:border-b-0"
            >
              {row.getVisibleCells().map((cell: any) => (
                <td key={cell.id} className="px-[20px]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCategoryHeader = (
    title: string,
    description: string,
    category: CategoryKey,
  ) => (
    <div className="flex items-center justify-between border-b border-black/10 bg-[#F5F5F5] px-[20px] py-[10px]">
      <div>
        <ECFTypography type="subtitle2">{title}</ECFTypography>
        <ECFTypography type="body2" className="text-black/60">
          {description}
        </ECFTypography>
      </div>
      <div className="flex items-center gap-[10px]">
        <CollapseButton
          isExpanded={expanded[category]}
          onChange={() => toggleCategory(category)}
        />
        <MetricButton onClick={() => {}} />
        <FilterButton onClick={() => {}} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-[20px]">
      <ActionSectionHeader
        isExpanded={isPageExpanded}
        isFiltered={isFiltered}
        onChangeExpand={() => setIsPageExpanded((pre) => !pre)}
        onChangeFilter={() => setIsFiltered((pre) => !pre)}
      />

      <TableSectionHeader title="Project Overview" description="" />

      <div className="flex flex-col gap-[20px]">
        <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Basics].title,
            CATEGORIES[CreateProjectStep.Basics].description,
            CreateProjectStep.Basics,
          )}
          <div
            className="table-content-wrapper"
            style={getAnimationStyle(expanded[CreateProjectStep.Basics])}
          >
            {renderTable(basicsTable)}
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Dates].title,
            CATEGORIES[CreateProjectStep.Dates].description,
            CreateProjectStep.Dates,
          )}
          <div
            className="table-content-wrapper"
            style={getAnimationStyle(expanded[CreateProjectStep.Dates])}
          >
            {renderTable(datesTable)}
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Technicals].title,
            CATEGORIES[CreateProjectStep.Technicals].description,
            CreateProjectStep.Technicals,
          )}
          <div
            className="table-content-wrapper"
            style={getAnimationStyle(expanded[CreateProjectStep.Technicals])}
          >
            {renderTable(technicalsTable)}
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Organization].title,
            CATEGORIES[CreateProjectStep.Organization].description,
            CreateProjectStep.Organization,
          )}
          <div
            className="table-content-wrapper"
            style={getAnimationStyle(expanded[CreateProjectStep.Organization])}
          >
            {renderTable(organizationTable)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;
