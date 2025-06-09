import { cn } from '@heroui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FC, useMemo } from 'react';

import { Button } from '@/components/base';
import BaseTableRenderer from '@/components/biz/table/BaseTableRenderer';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';

import BackButton from './BackButton';
import {
  ITableMetaOfShared,
  itemDataToTableRows,
  useSharedColumns,
} from './columns';
import { IDataForPreview } from './SubmitItemProposal';

interface IPreviewStepProps {
  isShow: boolean;
  data: IDataForPreview;
  itemKey: IPocItemKey;
  onConfirmSubmit: () => void;
  onGoBack: () => void;
  isSubmitting: boolean;
  expandedRows: Partial<Record<IPocItemKey, boolean>>;
  toggleRowExpanded: (key: IPocItemKey) => void;
}

const PreviewStep: FC<IPreviewStepProps> = ({
  data,
  itemKey,
  onConfirmSubmit,
  onGoBack,
  isSubmitting,
  isShow,
  expandedRows,
  toggleRowExpanded,
}) => {
  const { showReferenceModal } = useProjectDetailContext();
  const tableData = useMemo(
    () => itemDataToTableRows(data, itemKey),
    [data, itemKey],
  );

  const itemConfig = useMemo(() => {
    return AllItemConfig[itemKey as IPocItemKey]!;
  }, [itemKey]);

  const label = useMemo(() => {
    return itemConfig.label;
  }, [itemConfig]);

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
      <div className="flex justify-start">
        <BackButton onPress={onGoBack}>Back</BackButton>
      </div>

      <div className="flex flex-col gap-[10px]">
        <h3 className="font-mona text-[18px] font-[700] leading-[20px] text-black/80">
          Review your edit for {label}
        </h3>
        <p className="text-[13px] text-black/80">
          Check your edit carefully before submission. This action is not
          re-doable.
        </p>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
        <BaseTableRenderer
          tableInstance={tableInstance}
          columns={columns}
          expandedRows={expandedRows}
        />
      </div>

      <div>
        <Button
          color="primary"
          onClick={onConfirmSubmit}
          isLoading={isSubmitting}
          className="w-full"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep;
