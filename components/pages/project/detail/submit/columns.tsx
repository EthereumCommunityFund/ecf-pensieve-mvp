import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, ReferenceCol } from '@/components/biz/table';
import { IBaeTableRow } from '@/components/biz/table/BaseTableRenderer';
import { IPocItemKey } from '@/types/item';

import { IDataForPreview } from './SubmitItemProposal';

export interface ITableDisplayRow extends IBaeTableRow {
  id: string;
}

export const itemDataToTableRows = (
  data: IDataForPreview,
  itemKey: IPocItemKey,
): ITableDisplayRow[] => {
  return [
    {
      id: 'input',
      key: itemKey,
      value: data.value,
      reference: data.ref,
      reason: data.reason,
    },
  ];
};

export interface ITableMetaOfShared {
  showReferenceModal: (value: string, key: IPocItemKey, reason: string) => void;
  toggleRowExpanded: (key: IPocItemKey) => void;
  expandedRows: Partial<Record<IPocItemKey, boolean>>;
}

export const useSharedColumns = () => {
  const columnHelper = useMemo(
    () => createColumnHelper<ITableDisplayRow>(),
    [],
  );

  return useMemo(() => {
    const inputColumn = columnHelper.accessor('value', {
      id: 'value',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;
        const { toggleRowExpanded, expandedRows } = info.table.options
          .meta as ITableMetaOfShared;
        const isRowExpanded = expandedRows[item.key];

        // Create a minimal item object that matches IKeyItemDataForTable interface
        const minimalItem = {
          key: item.key,
          property: '',
          input: info.getValue(),
          reference: item.reference
            ? { key: item.key, value: item.reference }
            : null,
          submitter: {
            userId: 'default',
            name: 'User',
            avatarUrl: null,
            address: '',
            weight: null,
            invitationCodeId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          projectId: 0,
          proposalId: 0,
          itemTopWeight: 0,
          accountability: [],
          legitimacy: [],
          canBePropose: false,
          isConsensusInProgress: false,
          isPendingValidation: false,
        };

        return (
          <InputCol.Cell
            value={info.getValue()}
            item={minimalItem}
            itemKey={item.key as any}
            isExpanded={isRowExpanded}
            onToggleExpand={
              toggleRowExpanded ? () => toggleRowExpanded(item.key) : undefined
            }
          />
        );
      },
    });

    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => <ReferenceCol.Header />,
      size: 124,
      cell: (info) => {
        const referenceValue = info.getValue();
        const item = info.row.original;
        const { showReferenceModal } = info.table.options
          .meta as ITableMetaOfShared;
        return (
          <ReferenceCol.Cell
            hasReference={!!referenceValue}
            onShowReference={() => {
              showReferenceModal(
                referenceValue || '',
                item.key as IPocItemKey,
                item.reason || '',
              );
            }}
          />
        );
      },
    });

    return [inputColumn, referenceColumn];
  }, [columnHelper]);
};
