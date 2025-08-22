import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';

/**
 * Service for filtering table data based on various criteria
 */
export class TableFilterService {
  /**
   * Check if an item is pending (has proposals but not validated)
   */
  static isPendingItem(item: IKeyItemDataForTable): boolean {
    // An item is pending if it has isPendingValidation flag
    return item.isPendingValidation === true;
  }

  /**
   * Check if an item is empty (marked as empty or no input value)
   */
  static isEmptyItem(item: IKeyItemDataForTable): boolean {
    // Check if explicitly marked as empty
    if (item.isEmptyItem === true) return true;

    // Also check if input is empty
    if (!item.input) return true;

    // Check for various empty conditions
    if (typeof item.input === 'string') {
      return (
        item.input.trim() === '' ||
        item.input === 'null' ||
        item.input === 'undefined'
      );
    }

    // For objects, check if they're empty
    if (typeof item.input === 'object' && item.input !== null) {
      return Object.keys(item.input).length === 0;
    }

    return false;
  }

  /**
   * Filter items that are pending
   */
  static filterPendingItems(
    items: IKeyItemDataForTable[],
  ): IKeyItemDataForTable[] {
    return items.filter((item) => this.isPendingItem(item));
  }

  /**
   * Filter items that are empty
   */
  static filterEmptyItems(
    items: IKeyItemDataForTable[],
  ): IKeyItemDataForTable[] {
    return items.filter((item) => this.isEmptyItem(item));
  }

  /**
   * Apply combined filters to items
   */
  static applyFilters(
    items: IKeyItemDataForTable[],
    filters: {
      showPendingOnly: boolean;
      showEmptyOnly: boolean;
    },
  ): IKeyItemDataForTable[] {
    let filteredItems = [...items];

    // Apply filters (mutually exclusive as per requirements)
    if (filters.showPendingOnly) {
      filteredItems = this.filterPendingItems(filteredItems);
    } else if (filters.showEmptyOnly) {
      filteredItems = this.filterEmptyItems(filteredItems);
    }

    return filteredItems;
  }

  /**
   * Count items by type
   */
  static countItems(items: IKeyItemDataForTable[]): {
    total: number;
    pending: number;
    empty: number;
  } {
    const counts = {
      total: items.length,
      pending: 0,
      empty: 0,
    };

    items.forEach((item) => {
      if (this.isPendingItem(item)) {
        counts.pending++;
      }
      if (this.isEmptyItem(item)) {
        counts.empty++;
      }
    });

    return counts;
  }

  /**
   * Count items across multiple categories
   */
  static countItemsAcrossCategories(
    tableData: Record<string, IKeyItemDataForTable[]>,
  ): {
    total: number;
    pending: number;
    empty: number;
  } {
    const counts = {
      total: 0,
      pending: 0,
      empty: 0,
    };

    Object.values(tableData).forEach((categoryItems) => {
      const categoryCounts = this.countItems(categoryItems);
      counts.total += categoryCounts.total;
      counts.pending += categoryCounts.pending;
      counts.empty += categoryCounts.empty;
    });

    return counts;
  }
}
