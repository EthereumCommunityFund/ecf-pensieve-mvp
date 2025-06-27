'use client';

import React from 'react';

import {
  ModalTableContainer,
  TableCellSkeleton,
  TableHeader,
  TableRowSkeleton,
} from '@/components/biz/table';

export interface ModalTableSkeletonProps {
  /** Number of skeleton rows to display */
  rowCount?: number;
  /** Column configurations for the skeleton table */
  columns?: Array<{
    /** Column header text */
    header: string;
    /** Column width */
    width?: number;
    /** Whether this is the last column */
    isLast?: boolean;
  }>;
  /** Whether to show the table header */
  showHeader?: boolean;
  /** Custom className for the container */
  className?: string;
}

/**
 * Default column configuration for modal tables
 * Matches the useCommonColumnsOfModal structure used in SubmissionQueue and Displayed components
 */
const DEFAULT_COLUMNS = [
  { header: 'Input', width: 480 },
  { header: 'Reference', width: 124 },
  { header: 'Submitter', width: 183 },
  { header: 'Support', width: 150, isLast: true },
];

export const ModalTableSkeleton: React.FC<ModalTableSkeletonProps> = ({
  rowCount = 3,
  columns = DEFAULT_COLUMNS,
  showHeader = true,
  className,
}) => {
  return (
    <ModalTableContainer allowInternalBorderRadius className={className}>
      <table className="w-full border-separate border-spacing-0">
        {/* Table Header */}
        {showHeader && (
          <thead>
            <tr className="bg-[#F5F5F5]">
              {columns.map((column, index) => (
                <TableHeader
                  key={`skeleton-header-${index}`}
                  width={column.width}
                  isFirst={index === 0}
                  isLast={column.isLast || index === columns.length - 1}
                  isContainerBordered={true}
                  allowRoundedCorners={true}
                  className="h-auto bg-[#F5F5F5]"
                >
                  {column.header}
                </TableHeader>
              ))}
            </tr>
          </thead>
        )}

        {/* Table Body - Skeleton Rows */}
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRowSkeleton
              key={`skeleton-row-${rowIndex}`}
              isLastRow={rowIndex === rowCount - 1}
            >
              {columns.map((column, cellIndex) => (
                <TableCellSkeleton
                  key={`skeleton-cell-${rowIndex}-${cellIndex}`}
                  width={column.width}
                  isFirst={cellIndex === 0}
                  isLast={column.isLast || cellIndex === columns.length - 1}
                  isLastRow={rowIndex === rowCount - 1}
                  isContainerBordered={true}
                  minHeight={60}
                  skeletonWidth={
                    cellIndex === 0
                      ? 'w-full' // Input column - full width skeleton (main content)
                      : cellIndex === 1
                        ? 'w-2/3' // Reference column - medium skeleton (button or "empty")
                        : cellIndex === 2
                          ? 'w-3/4' // Submitter column - shorter skeleton (name + date)
                          : cellIndex === 3
                            ? 'w-1/2' // Support column - shorter skeleton (numbers)
                            : 'w-1/3' // Additional columns - shortest skeleton
                  }
                />
              ))}
            </TableRowSkeleton>
          ))}
        </tbody>
      </table>
    </ModalTableContainer>
  );
};
