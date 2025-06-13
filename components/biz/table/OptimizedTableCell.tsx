'use client';

import { cn } from '@heroui/react';
import { memo } from 'react';

import OptimizedCellRenderer from './OptimizedCellRenderer';

export interface OptimizedTableCellProps {
  cell: any;
  cellIndex: number;
  width?: number | string;
  isLast?: boolean;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  colspan?: number;
  isContainerBordered?: boolean;
}

/**
 * Optimized TableCell component that prevents unnecessary re-renders
 * by using memoization and stable keys
 */
const OptimizedTableCell = memo(
  ({
    cell,
    cellIndex,
    width,
    isLast = false,
    isLastRow = false,
    className,
    style,
    minHeight = 60,
    colspan,
    isContainerBordered = false,
  }: OptimizedTableCellProps) => {
    const cellStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      boxSizing: 'border-box' as const,
      ...style,
    };

    // Smart border logic based on container type
    const getBorderClasses = () => {
      if (isContainerBordered) {
        // For bordered containers: no left border, conditional right border, keep bottom border for row separation
        return cn(
          'border-l-0',
          isLast ? 'border-r-0' : 'border-r border-black/10',
          isLastRow ? 'border-b-0' : 'border-b border-black/10',
        );
      } else {
        // For non-bordered containers: default behavior
        return cn(
          'border-l border-b border-black/10',
          isLast && 'border-r',
          // isLastRow && 'border-b-0',
        );
      }
    };

    return (
      <td
        style={cellStyle}
        colSpan={colspan}
        className={cn('hover:bg-[#EBEBEB]', getBorderClasses(), className)}
      >
        <OptimizedCellRenderer
          cell={cell}
          cellIndex={cellIndex}
          isLast={isLast}
          isLastRow={isLastRow}
          minHeight={minHeight}
          isContainerBordered={isContainerBordered}
        />
      </td>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if essential props have changed

    // Check basic properties
    if (
      prevProps.cell.id !== nextProps.cell.id ||
      prevProps.cellIndex !== nextProps.cellIndex ||
      prevProps.width !== nextProps.width ||
      prevProps.isLast !== nextProps.isLast ||
      prevProps.isLastRow !== nextProps.isLastRow ||
      prevProps.minHeight !== nextProps.minHeight ||
      prevProps.isContainerBordered !== nextProps.isContainerBordered ||
      prevProps.className !== nextProps.className
    ) {
      return false;
    }

    // Check cell value changes
    if (prevProps.cell.getValue() !== nextProps.cell.getValue()) {
      return false;
    }

    // Check pinned status changes
    const prevIsPinned = prevProps.cell.column.getIsPinned();
    const nextIsPinned = nextProps.cell.column.getIsPinned();
    if (prevIsPinned !== nextIsPinned) {
      return false;
    }

    // Specifically check key properties of style object (avoid JSON.stringify performance overhead)
    if (prevProps.style || nextProps.style) {
      const prevStyle = prevProps.style || {};
      const nextStyle = nextProps.style || {};

      // Check key style properties
      if (
        prevStyle.left !== nextStyle.left ||
        prevStyle.right !== nextStyle.right ||
        prevStyle.position !== nextStyle.position ||
        prevStyle.zIndex !== nextStyle.zIndex ||
        prevStyle.backgroundColor !== nextStyle.backgroundColor ||
        prevStyle.transform !== nextStyle.transform
      ) {
        return false;
      }
    }

    // Don't re-render in other cases
    return true;
  },
);

OptimizedTableCell.displayName = 'OptimizedTableCell';

export default OptimizedTableCell;
