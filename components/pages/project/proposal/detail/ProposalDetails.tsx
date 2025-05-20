'use client';

import { Skeleton } from '@heroui/react';
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import {
  CreateProjectStep,
  IRef,
} from '@/components/pages/project/create/types';
import { useProposalVotes } from '@/components/pages/project/proposal/detail/useProposalVotes';
import { StorageKey_DoNotShowCancelModal } from '@/constants/storage';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { IProject, IProposal } from '@/types';
import { safeGetLocalStorage } from '@/utils/localStorage';

import { CollapseButton, FilterButton, MetricButton } from './ActionButtons';
import ActionSectionHeader from './ActionSectionHeader';
import TableSectionHeader from './TableSectionHeader';
import { CATEGORIES, FIELD_LABELS } from './constants';
import CancelVoteModal from './table/CancelVoteModal';
import ReferenceModal from './table/ReferenceModal';
import SwitchVoteModal from './table/SwitchVoteModal';
import TooltipItemWeight from './table/TooltipItemWeight';
import TooltipTh from './table/TooltipTh';
import VoteItem from './table/VoteItem';

export interface ITableProposalItem {
  key: string;
  property: string;
  input: string;
  reference: string;
  support: number;
}

export type CategoryKey = CreateProjectStep;

interface ProposalDetailsProps {
  proposal?: IProposal;
  proposals: IProposal[];
  project?: IProject;
  projectId: number;
  isFiltered: boolean;
  toggleFiltered: () => void;
  isPageExpanded: boolean;
  toggleExpanded: () => void;
}

const ProposalDetails = ({
  proposal,
  projectId,
  project,
  proposals,
  isPageExpanded,
  toggleExpanded,
  isFiltered,
  toggleFiltered,
}: ProposalDetailsProps) => {
  const { profile } = useAuth();
  const [expanded, setExpanded] = useState<Record<CategoryKey, boolean>>({
    [CreateProjectStep.Basics]: true,
    [CreateProjectStep.Dates]: true,
    [CreateProjectStep.Technicals]: true,
    [CreateProjectStep.Organization]: true,
  });

  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [currentReferenceKey, setCurrentReferenceKey] = useState('');

  const [currentVoteItem, setCurrentVoteItem] =
    useState<ITableProposalItem | null>(null);
  const [sourceProposal, setSourceProposal] = useState<IProposal | null>(null);

  const [doNotShowCancelModal, setDoNotShowCancelModal] =
    useState<boolean>(false);

  const isOverallLoading = !proposal;

  const {
    votesOfKeyInProposalMap,
    userVotesOfProposalMap,
    isUserVotedInProposal,
    isFetchVoteInfoLoading,
    isVoteActionPending,
    onCancelVote,
    onSwitchVote,
    handleVoteAction,
    switchVoteMutation,
    cancelVoteMutation,
  } = useProposalVotes(proposal, projectId, proposals);

  useEffect(() => {
    const savedValue = safeGetLocalStorage(StorageKey_DoNotShowCancelModal);
    setDoNotShowCancelModal(savedValue === 'true');
  }, []);

  const onVoteAction = useCallback(
    async (item: ITableProposalItem) => {
      if (!profile) {
        console.warn('not login');
        // TODO prompt to login ?
        return;
      }
      await handleVoteAction(item, doNotShowCancelModal, {
        setCurrentVoteItem,
        setIsCancelModalOpen,
        setIsSwitchModalOpen,
        setSourceProposal,
      });
    },
    [profile, handleVoteAction, doNotShowCancelModal],
  );

  const handleCancelVoteConfirm = useCallback(async () => {
    try {
      if (!currentVoteItem) return;
      await onCancelVote(userVotesOfProposalMap[currentVoteItem!.key].id);
      setIsCancelModalOpen(false);
    } catch (err) {
      // TODO toast
      console.error(err);
    }
  }, [currentVoteItem, userVotesOfProposalMap, onCancelVote]);

  const handleSwitchVoteConfirm = useCallback(async () => {
    try {
      if (!currentVoteItem) return;
      await onSwitchVote(currentVoteItem.key);
      setIsSwitchModalOpen(false);
    } catch (err) {
      // TODO toast
      console.error(err);
    }
  }, [currentVoteItem, onSwitchVote]);

  const onShowReference = useCallback((key: string) => {
    setCurrentReferenceKey(key);
    setIsReferenceModalOpen(true);
  }, []);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const expandableRowKeys = useMemo(() => {
    return ['projectName', 'mainDescription', 'projectType'];
  }, []);

  const isRowExpandable = useCallback(
    (key: string) => {
      return expandableRowKeys.includes(key);
    },
    [expandableRowKeys],
  );

  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const columnHelper = createColumnHelper<ITableProposalItem>();

  const columns = useMemo(() => {
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
        const isExpandable = isRowExpandable(rowKey);

        return (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              {isExpandable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpanded(rowKey);
                  }}
                  className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-gray-100"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: expandedRows[rowKey]
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path
                      d="M2 4L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              <span className="text-[14px] font-[600] leading-[20px] text-black">
                {info.getValue()}
              </span>
            </div>
            <TooltipItemWeight itemWeight={88} />
          </div>
        );
      },
    });

    const fieldTypeColumn = columnHelper.accessor('property', {
      id: 'fieldType',
      header: () => (
        <TooltipTh
          title="Field Type"
          tooltipContext="The type of the field for the project item"
        />
      ),
      size: 220,
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="font-mona flex items-center overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
            {value}
          </div>
        );
      },
    });

    const inputColumn = columnHelper.accessor('input', {
      header: () => (
        <TooltipTh
          title="Input"
          tooltipContext="The input value provided by the user"
        />
      ),
      size: isPageExpanded ? 480 : 250,
      cell: (info) => {
        const value = info.getValue();
        const key = info.row.original.key;

        const renderValue = () => {
          if (Array.isArray(value)) {
            return JSON.stringify(value);
          }
          return value;
        };

        return (
          <div
            className="font-mona flex items-center overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80"
            style={{ maxWidth: isPageExpanded ? '460px' : '230px' }}
          >
            {renderValue()}
          </div>
        );
      },
    });

    const referenceColumn = columnHelper.accessor('reference', {
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
                onPress={() => onShowReference(info.row.original.key)}
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

    const supportColumn = columnHelper.accessor('support', {
      header: () => (
        <TooltipTh
          title="Support"
          tooltipContext="Number of supporters for this property"
        />
      ),
      size: 220,
      cell: (info) => {
        const key = info.row.original.key;
        return (
          <VoteItem
            fieldKey={key}
            votesOfKey={votesOfKeyInProposalMap[key] || []}
            project={project!}
            proposal={proposal!}
            proposalItem={info.row.original}
            isLoading={isFetchVoteInfoLoading || isVoteActionPending}
            isUserVoted={isUserVotedInProposal(info.row.original.key)}
            votedMemberCount={
              votesOfKeyInProposalMap[info.row.original.key]?.length || 0
            }
            onAction={() => onVoteAction(info.row.original)}
          />
        );
      },
    });

    const resultColumns: ColumnDef<ITableProposalItem, any>[] = isPageExpanded
      ? [
          propertyColumn,
          fieldTypeColumn,
          inputColumn,
          referenceColumn,
          supportColumn,
        ]
      : [propertyColumn, inputColumn, referenceColumn, supportColumn];
    return resultColumns;
  }, [
    isPageExpanded,
    columnHelper,
    project,
    proposal,
    onVoteAction,
    isFetchVoteInfoLoading,
    isVoteActionPending,
    votesOfKeyInProposalMap,
    isUserVotedInProposal,
    isRowExpandable,
    expandedRows,
    toggleRowExpanded,
  ]);

  const tableData = useMemo(() => {
    const result: Record<CategoryKey, ITableProposalItem[]> = {
      [CreateProjectStep.Basics]: [],
      [CreateProjectStep.Dates]: [],
      [CreateProjectStep.Technicals]: [],
      [CreateProjectStep.Organization]: [],
    };

    if (!proposal) {
      return result;
    }

    proposal.items.forEach((item: any) => {
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
        const reference = (proposal.refs as IRef[])?.find(
          (ref) => ref.key === key,
        );

        result[category].push({
          key: key,
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

  const toggleCategory = useCallback((category: CategoryKey) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  }, []);

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

  const renderExpandedContent = (value: any, key: string) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return value;
  };

  const renderCategoryHeader = useCallback(
    (title: string, description: string, category: CategoryKey) => (
      <div
        className={cn(
          'flex items-center justify-between border border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]',
          expanded[category] ? 'rounded-t-[10px]' : 'rounded-[10px]',
        )}
      >
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            {title}
          </p>
          {description && (
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

  const renderTable = useCallback(
    (table: Table<ITableProposalItem>, forceSkeleton: boolean) => {
      const noDataForThisTable = table.options.data.length === 0;
      const showSkeleton = forceSkeleton || noDataForThisTable;

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

      const colGroupDefinition = (
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
      );

      if (showSkeleton) {
        return (
          <div className="overflow-hidden overflow-x-auto rounded-b-[10px] border border-t-0 border-black/10">
            <table className="box-border w-full table-fixed border-separate border-spacing-0">
              {colGroupDefinition}
              {tableHeaders}
              <tbody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={`skeleton-row-${rowIndex}`}>
                    {table.getAllColumns().map((column, cellIndex) => (
                      <td
                        key={`skeleton-cell-${column.id}-${rowIndex}`}
                        style={{
                          width: `${column.getSize()}px`,
                          boxSizing: 'border-box',
                        }}
                        className={` border-b border-r
                          border-black/10
                          ${cellIndex === table.getAllColumns().length - 1 ? 'border-r-0' : ''}
                          ${rowIndex === 4 ? 'border-b-0' : ''}
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
          <table
            className={cn(
              'box-border w-full  border-separate border-spacing-0',
              isPageExpanded ? '' : 'table-fixed',
            )}
          >
            {colGroupDefinition}
            {tableHeaders}
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr>
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
                          ${rowIndex === table.getRowModel().rows.length - 1 && !expandedRows[row.original.key] ? 'border-b-0' : ''}
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

                  {isRowExpandable(row.original.key) &&
                    expandedRows[row.original.key] && (
                      <tr key={`${row.id}-expanded`}>
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
                              {renderExpandedContent(
                                row.original.input,
                                row.original.key,
                              )}
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
      );
    },
    [isPageExpanded, isRowExpandable, expandedRows, toggleRowExpanded],
  );

  return (
    <div className="flex flex-col gap-[20px]">
      <ActionSectionHeader
        isExpanded={isPageExpanded}
        isFiltered={isFiltered}
        onChangeExpand={toggleExpanded}
        onChangeFilter={toggleFiltered}
      />

      <TableSectionHeader title="Project Overview" description="" />

      <div className="flex flex-col gap-[20px]">
        <div className="overflow-hidden rounded-[10px] bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Basics].title,
            CATEGORIES[CreateProjectStep.Basics].description,
            CreateProjectStep.Basics,
          )}
          <div style={getAnimationStyle(expanded[CreateProjectStep.Basics])}>
            {renderTable(basicsTable, isOverallLoading)}
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Dates].title,
            CATEGORIES[CreateProjectStep.Dates].description,
            CreateProjectStep.Dates,
          )}
          <div style={getAnimationStyle(expanded[CreateProjectStep.Dates])}>
            {renderTable(datesTable, isOverallLoading)}
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Technicals].title,
            CATEGORIES[CreateProjectStep.Technicals].description,
            CreateProjectStep.Technicals,
          )}
          <div
            style={getAnimationStyle(expanded[CreateProjectStep.Technicals])}
          >
            {renderTable(technicalsTable, isOverallLoading)}
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] bg-white">
          {renderCategoryHeader(
            CATEGORIES[CreateProjectStep.Organization].title,
            CATEGORIES[CreateProjectStep.Organization].description,
            CreateProjectStep.Organization,
          )}
          <div
            style={getAnimationStyle(expanded[CreateProjectStep.Organization])}
          >
            {renderTable(organizationTable, isOverallLoading)}
          </div>
        </div>
      </div>

      <SwitchVoteModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onConfirm={handleSwitchVoteConfirm}
        isLoading={switchVoteMutation.isPending}
        proposalItem={currentVoteItem || undefined}
        sourceProposal={sourceProposal || undefined}
      />

      <CancelVoteModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelVoteConfirm}
        isLoading={cancelVoteMutation.isPending}
        proposalItem={currentVoteItem || undefined}
      />

      <ReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        fieldKey={currentReferenceKey}
        refs={(proposal?.refs || []) as IRef[]}
      />
    </div>
  );
};

export default ProposalDetails;
