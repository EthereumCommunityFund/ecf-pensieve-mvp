'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';

import InputContentRenderer from './InputContentRenderer';

interface ExpandableRowProps {
  /** The row ID for unique key generation */
  rowId: string;
  /** The item key for configuration lookup */
  itemKey: string;
  /** The input value to display in the expanded content */
  inputValue: any;
  /** Whether the row is currently expanded */
  isExpanded: boolean;
  /** Number of columns to span */
  colSpan: number;
  /** Whether this is the last row (affects border styling) */
  isLastRow?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Function to toggle the expanded state */
  onToggleExpanded?: () => void;
}

/**
 * Pure UI component for rendering an expandable table row
 * Shows detailed input content when expanded
 */
export const ExpandableRow: FC<ExpandableRowProps> = ({
  rowId,
  itemKey,
  inputValue,
  isExpanded,
  colSpan,
  isLastRow = false,
  className,
  onToggleExpanded,
}) => {
  const itemConfig = AllItemConfig[itemKey as IEssentialItemKey];

  // Don't render if the item doesn't support expansion
  if (!itemConfig?.showExpand) {
    return null;
  }

  return (
    <tr
      key={`${rowId}-expanded`}
      className={cn(isExpanded ? '' : 'hidden', className)}
    >
      <td
        colSpan={colSpan}
        className={`border-b border-black/10 bg-[#E1E1E1] p-[20px] ${
          isLastRow ? 'border-b-0' : ''
        }`}
      >
        <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
          <div
            className={cn(
              'font-sans text-[13px] font-[400] text-black',
              itemConfig!.formDisplayType === 'founderList' ||
                itemConfig!.formDisplayType === 'websites' ||
                itemConfig!.formDisplayType === 'fundingReceivedGrants' ||
                itemConfig!.formDisplayType === 'tablePhysicalEntity'
                ? 'p-[0px]'
                : 'p-[20px] mobile:p-[10px]',
            )}
          >
            <InputContentRenderer
              itemKey={itemKey as IPocItemKey}
              value={inputValue}
              displayFormType={itemConfig!.formDisplayType}
              isEssential={itemConfig!.isEssential}
              isExpandable={true}
              isExpanded={true}
              onToggleExpanded={onToggleExpanded}
              isInExpandableRow={true}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};
