'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base';
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
import { IProject, IProposal } from '@/types';

import { CollapseButton, FilterButton, MetricButton } from './ActionButtons';
import ActionSectionHeader from './ActionSectionHeader';
import TableSectionHeader from './TableSectionHeader';
import TooltipItemWeight from './table/TooltipItemWeight';
import TooltipTh from './table/TooltipTh';
import VoteItem from './table/VoteItem';

export interface ITableProposalItem {
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
  project?: IProject;
  projectId: number;
}

const ProposalDetails = ({
  proposal,
  projectId,
  project,
}: ProposalDetailsProps) => {
  const [isPageExpanded, setIsPageExpanded] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const [expanded, setExpanded] = useState<Record<CategoryKey, boolean>>({
    [CreateProjectStep.Basics]: true,
    [CreateProjectStep.Dates]: true,
    [CreateProjectStep.Technicals]: true,
    [CreateProjectStep.Organization]: true,
  });

  const columnHelper = createColumnHelper<ITableProposalItem>();

  const columns = [
    columnHelper.accessor('property', {
      header: () => (
        <TooltipTh
          title="Property"
          tooltipContext="The property name of the project item"
        />
      ),
      size: 220,
      cell: (info) => {
        return (
          <div className="flex w-full items-center justify-between">
            <span className="text-[14px] font-[600] leading-[20px] text-black">
              {info.getValue()}
            </span>
            <TooltipItemWeight itemWeight={88} />
          </div>
        );
      },
    }),
    columnHelper.accessor('input', {
      header: () => (
        <TooltipTh
          title="Input"
          tooltipContext="The input value provided by the user"
        />
      ),
      size: 250,
      cell: (info) => {
        const value = info.getValue();
        return (
          <div
            className="flex items-center overflow-hidden whitespace-normal break-words"
            style={{ maxWidth: '230px' }}
          >
            {value}
          </div>
        );
      },
    }),
    columnHelper.accessor('reference', {
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
    }),
    columnHelper.accessor('support', {
      header: () => (
        <TooltipTh
          title="Support"
          tooltipContext="Number of supporters for this property"
        />
      ),
      size: 220,
      cell: (info) => {
        return (
          <VoteItem
            project={project!}
            proposal={proposal!}
            proposalItem={info.row.original}
          />
        );
      },
    }),
  ];

  const tableData = useMemo(() => {
    const result: Record<CategoryKey, ITableProposalItem[]> = {
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
          support: 1,
        });
      }
    });

    return result;
  }, [proposal]);

  const basicsTable = useReactTable<ITableProposalItem>({
    data: tableData[CreateProjectStep.Basics],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const datesTable = useReactTable<ITableProposalItem>({
    data: tableData[CreateProjectStep.Dates],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const technicalsTable = useReactTable<ITableProposalItem>({
    data: tableData[CreateProjectStep.Technicals],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const organizationTable = useReactTable<ITableProposalItem>({
    data: tableData[CreateProjectStep.Organization],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleCategory = (category: CategoryKey) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
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

  const renderTable = useCallback(
    (table: Table<ITableProposalItem>) => (
      <div className="overflow-hidden overflow-x-auto rounded-b-[10px] border border-t-0 border-black/10">
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            {table.getAllColumns().map((column) => (
              <col
                key={column.id}
                style={{
                  width: `${column.getSize()}px`,
                }}
              />
            ))}
          </colgroup>
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
                    className={` border-b border-r
                      border-black/10
                      ${cellIndex === row.getVisibleCells().length - 1 ? 'border-r-0' : ''}
                      ${rowIndex === table.getRowModel().rows.length - 1 ? 'border-b-0' : ''}
                    `}
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
        </table>
      </div>
    ),
    [],
  );

  const renderCategoryHeader = useCallback(
    (title: string, description: string, category: CategoryKey) => (
      <div className="flex items-center justify-between rounded-t-[10px] border border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            {title}
          </p>
          {description ?? (
            <p className="text-[13px] font-[600] leading-[18px] text-black/40">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-[10px]">
          <CollapseButton
            isExpanded={expanded[category]}
            onChange={() => toggleCategory(category)}
          />
          <MetricButton onClick={() => {}} />
          <FilterButton onClick={() => {}} />
        </div>
      </div>
    ),
    [expanded, toggleCategory],
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
        <div className="overflow-hidden rounded-[10px] bg-white">
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

        <div className="overflow-hidden rounded-[10px] bg-white">
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

        <div className="overflow-hidden rounded-[10px] bg-white">
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

        <div className="overflow-hidden rounded-[10px] bg-white">
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
