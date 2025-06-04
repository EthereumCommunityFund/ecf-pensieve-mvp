import { cn } from '@heroui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FC, useMemo } from 'react';

import { Button } from '@/components/base';
import BaseTableRenderer from '@/components/biz/table/BaseTableRenderer';
import CheckedCircleIcon from '@/components/icons/CheckCircle';
import { IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';

import AnimationSection from './AnimationSection';
import { IDataForPreview } from './SubmitItemProposal';
import {
  ITableMetaOfShared,
  itemDataToTableRows,
  useSharedColumns,
} from './columns';

interface ISuccessStepProps {
  isShow: boolean;
  data: IDataForPreview;
  itemKey: IPocItemKey;
  onClose: () => void;
  onViewSubmission: () => void;
  isNewItem: boolean;
  expandedRows: Partial<Record<IPocItemKey, boolean>>;
  toggleRowExpanded: (key: IPocItemKey) => void;
}

const SuccessStep: FC<ISuccessStepProps> = ({
  data,
  itemKey,
  onClose,
  onViewSubmission,
  isShow,
  isNewItem,
  expandedRows,
  toggleRowExpanded,
}) => {
  const { showReferenceModal } = useProjectDetailContext();
  const tableData = useMemo(
    () => itemDataToTableRows(data, itemKey),
    [data, itemKey],
  );

  const columns = useSharedColumns();

  const tableMeta: ITableMetaOfShared = {
    showReferenceModal: showReferenceModal,
    toggleRowExpanded: toggleRowExpanded,
    expandedRows: expandedRows,
  };

  const tableInstance = useReactTable({
    data: tableData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    meta: tableMeta,
  });

  return (
    <div
      className={cn('flex-col gap-[20px] p-[20px]', isShow ? 'flex' : 'hidden')}
    >
      {isNewItem ? (
        <AnimationSection itemKey={itemKey} />
      ) : (
        <div className="flex items-center gap-2">
          <CheckedCircleIcon />
          <h2 className="text-[18px] font-[500] leading-[1.6] text-black">
            Your proposal is submitted
          </h2>
        </div>
      )}

      <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white">
        <BaseTableRenderer
          tableInstance={tableInstance}
          columns={columns}
          expandedRows={expandedRows}
        />
      </div>

      <div className="flex w-full gap-[20px]">
        <Button color="secondary" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button color="primary" onClick={onViewSubmission} className="flex-1">
          View Your Proposal
        </Button>
      </div>
    </div>
  );
};

export default SuccessStep;
