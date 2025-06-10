'use client';

import { flexRender } from '@tanstack/react-table';
import { memo, useMemo } from 'react';

interface OptimizedCellRendererProps {
  cell: any;
  cellIndex: number;
  isLast: boolean;
  isLastRow: boolean;
  minHeight?: number;
  className?: string;
  isContainerBordered?: boolean;
  style?: React.CSSProperties;
}

/**
 * Optimized cell renderer that prevents unnecessary re-renders
 * by memoizing the cell content based on actual data changes
 */
const OptimizedCellRenderer = memo(
  ({
    cell,
    cellIndex,
    isLast,
    isLastRow,
    minHeight = 60,
    className,
    isContainerBordered = false,
    style,
  }: OptimizedCellRendererProps) => {
    // Create a stable context object that only changes when actual data changes
    const stableContext = useMemo(() => {
      const context = cell.getContext();
      return {
        ...context,
        // Extract only the essential data that affects rendering
        value: context.getValue(),
        row: {
          ...context.row,
          original: context.row.original,
          index: context.row.index,
          id: context.row.id,
        },
        column: {
          ...context.column,
          id: context.column.id,
          columnDef: context.column.columnDef,
        },
        table: context.table,
      };
    }, [
      cell,
      // We depend on the entire cell object since it contains all the necessary data
      // The memo comparison in OptimizedTableCell will handle the fine-grained comparison
    ]);

    // Memoize the rendered content
    const renderedContent = useMemo(() => {
      return flexRender(cell.column.columnDef.cell, stableContext);
    }, [cell.column.columnDef.cell, stableContext]);

    return (
      <div
        className="flex w-full items-center overflow-hidden whitespace-normal break-words p-[10px] text-[16px] leading-[19px]"
        style={{ minHeight: `${minHeight}px`, ...style }}
      >
        {renderedContent}
      </div>
    );
  },
);

OptimizedCellRenderer.displayName = 'OptimizedCellRenderer';

export default OptimizedCellRenderer;
