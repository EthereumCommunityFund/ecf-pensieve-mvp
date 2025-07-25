'use client';

import { cn } from '@heroui/react';
import { ReactNode } from 'react';

export interface TableContainerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Whether to show borders around the table container */
  bordered?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Background color variant */
  background?: 'white' | 'transparent';
}

/**
 * Smart table container that automatically handles border logic
 *
 * This component provides a consistent way to wrap tables and automatically
 * passes the correct border context to child TableHeader and TableCell components.
 *
 * @example
 * ```tsx
 * // Bordered table (for modals)
 * <TableContainer bordered rounded>
 *   <table className="w-full border-separate border-spacing-0">
 *     <thead>
 *       <tr className="bg-[#F5F5F5]">
 *         <TableHeader isContainerBordered>Header 1</TableHeader>
 *         <TableHeader isContainerBordered isLast>Header 2</TableHeader>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr>
 *         <TableCell isContainerBordered>Cell 1</TableCell>
 *         <TableCell isContainerBordered isLast>Cell 2</TableCell>
 *       </tr>
 *     </tbody>
 *   </table>
 * </TableContainer>
 *
 * // Simple table (for regular pages)
 * <TableContainer>
 *   <table className="w-full border-separate border-spacing-0">
 *     <thead>
 *       <tr className="bg-[#F5F5F5]">
 *         <TableHeader>Header 1</TableHeader>
 *         <TableHeader isLast>Header 2</TableHeader>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr>
 *         <TableCell>Cell 1</TableCell>
 *         <TableCell isLast>Cell 2</TableCell>
 *       </tr>
 *     </tbody>
 *   </table>
 * </TableContainer>
 * ```
 */
export const TableContainer = ({
  children,
  className,
  style,
  bordered = false,
  rounded = false,
  background = 'transparent',
  ...props
}: TableContainerProps) => {
  const containerClasses = cn(
    // If rounded, add overflow-hidden to ensure the container clips the child content
    rounded && 'overflow-hidden rounded-[10px]',
    bordered && 'border border-black/10',
    background === 'white' && 'bg-white',
    className,
  );

  return (
    <div className={containerClasses} style={style} {...props}>
      {children}
    </div>
  );
};

/**
 * Pre-configured table container for modal usage
 *
 * This is a convenience component that provides the most common
 * configuration for tables in modals.
 */
export const ModalTableContainer = ({
  children,
  className,
  // Destructure and ignore allowInternalBorderRadius to prevent it from reaching the DOM
  allowInternalBorderRadius,
  ...props
}: Omit<TableContainerProps, 'bordered' | 'rounded' | 'background'> & {
  allowInternalBorderRadius?: boolean;
}) => {
  return (
    <TableContainer
      bordered
      rounded
      background="white"
      className={cn(
        // Use the same scrollbar style as CategoryTable
        // '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:bg-gray-100',
        'tablet:w-auto mobile:w-auto',
        className,
      )}
      style={{
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100%',
        width: '100%',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </TableContainer>
  );
};

/**
 * Pre-configured table container for page usage
 *
 * This is a convenience component that provides the most common
 * configuration for tables in regular pages.
 */
export const PageTableContainer = ({
  children,
  className,
  // Destructure and ignore allowInternalBorderRadius to prevent it from reaching the DOM
  allowInternalBorderRadius,
  ...props
}: Omit<TableContainerProps, 'bordered' | 'rounded' | 'background'> & {
  allowInternalBorderRadius?: boolean;
}) => {
  return (
    <TableContainer className={className} {...props}>
      {children}
    </TableContainer>
  );
};
