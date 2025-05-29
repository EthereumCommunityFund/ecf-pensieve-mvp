import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useParams } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { IModalContentType } from '@/app/project/[id]/page';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { TableCell, TableHeader } from '@/components/biz/table';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';
import {
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import { trpc } from '@/lib/trpc/client';
import { IItemConfig, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

import { useProjectDetailContext } from '../../context/projectDetailContext';
import AddReferenceModal from '../../create/AddReferenceModal';
import { DefaultFieldApplicabilityMap } from '../../create/form/FormData';
import { IProjectTableRowData } from '../types';

import EditReasonUIContainer from './EditReasonUIContainer';

interface ITableDisplayRow {
  id: string;
  field: string;
  value: React.ReactNode;
}

const itemDataToTableRows = (
  data: { value: any; ref: string; reason: string },
  itemConfig: IItemConfig<any>,
  isSuccessScreen: boolean = false,
): ITableDisplayRow[] => {
  const rows: ITableDisplayRow[] = [];

  rows.push({
    id: 'input',
    field: isSuccessScreen
      ? `Input (${itemConfig.label})`
      : `Input: ${itemConfig.label}`,
    value: (
      <div
        className={`mt-1 rounded-md border p-2 ${isSuccessScreen ? 'bg-gray-100' : 'bg-white'} min-h-[40px] whitespace-pre-wrap`}
      >
        {String(data.value) || '(empty)'}
      </div>
    ),
  });

  if (data.ref) {
    rows.push({
      id: 'reference',
      field: 'Reference',
      value: (
        <div
          className={`mt-1 rounded-md border p-2 ${isSuccessScreen ? 'bg-gray-100' : 'bg-white'} min-h-[40px] whitespace-pre-wrap`}
        >
          {data.ref}
        </div>
      ),
    });
  }

  rows.push({
    id: 'reason',
    field: 'Edit Reason',
    value: (
      <div
        className={`mt-1 rounded-md border p-2 ${isSuccessScreen ? 'bg-gray-100' : 'bg-white'} min-h-[40px] whitespace-pre-wrap`}
      >
        {data.reason || (isSuccessScreen ? 'not available' : '(not provided)')}
      </div>
    ),
  });
  return rows;
};

const sharedTableColumns: ColumnDef<ITableDisplayRow>[] = [
  {
    accessorKey: 'field',
    header: () => <span className="font-semibold">Field</span>,
    cell: (info) => (
      <label className="text-sm font-medium text-gray-700">
        {info.getValue() as string}
      </label>
    ),
    size: 150,
  },
  {
    accessorKey: 'value',
    header: () => <span className="font-semibold">Details</span>,
    cell: (info) => info.getValue() as React.ReactNode,
  },
];

export interface ISubmitItemProposalProps {
  itemKey: IPocItemKey;
  displayProposalDataOfKey?: IProjectTableRowData;
  setModalContentType: (contentType: IModalContentType) => void;
}

interface IFormData extends IProjectFormData {
  [key: string]: any;
}

const SubmitItemProposal: FC<ISubmitItemProposalProps> = ({
  itemKey,
  displayProposalDataOfKey,
  setModalContentType,
}) => {
  const { id: projectId } = useParams();
  const { refetchProposalsByKey } = useProjectDetailContext();

  const [fieldApplicability, setFieldApplicability] = useState<
    Record<string, boolean>
  >(DefaultFieldApplicabilityMap);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [references, setReferences] = useState<IReferenceData[]>([]);
  const [currentReferenceField, setCurrentReferenceField] = useState({
    key: '',
    label: '',
    existingReference: null as IReferenceData | null,
  });

  const itemConfig = useMemo(
    () => AllItemConfig[itemKey as IPocItemKey]!,
    [itemKey],
  );

  const methods = useForm<IFormData>({
    defaultValues: {
      [itemConfig.key]: '',
    },
  });
  const { control, handleSubmit, setValue, clearErrors, formState } = methods;

  const [editReason, setEditReason] = useState('');
  const [submissionStep, setSubmissionStep] = useState<
    'form' | 'preview' | 'success'
  >('form');
  const [dataForPreviewOrSubmit, setDataForPreviewOrSubmit] = useState<{
    value: any;
    ref: string;
    reason: string;
  } | null>(null);

  const createItemProposalMutation =
    trpc.itemProposal.createItemProposal.useMutation();

  const handleApplicabilityChange = useCallback(
    (field: string, value: boolean) => {
      setFieldApplicability((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (!value) {
        clearErrors(field as keyof IProjectFormData);
      }
    },
    [clearErrors],
  );

  const getFieldReference = useCallback(
    (fieldKey: string): IReferenceData | null => {
      return references.find((ref) => ref.key === fieldKey) || null;
    },
    [references],
  );

  const handleAddReference = useCallback(
    (key: string, label?: string) => {
      const existingReference = getFieldReference(key);
      setCurrentReferenceField({
        key,
        label: label || key,
        existingReference,
      });
      setIsReferenceModalOpen(true);
    },
    [getFieldReference],
  );

  const handleSaveReference = useCallback((reference: IReferenceData) => {
    setReferences((prev) => {
      const existingIndex = prev.findIndex((ref) => ref.key === reference.key);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = reference;
        return updated;
      }
      return [...prev, reference];
    });
  }, []);

  const handleRemoveReference = useCallback((fieldKey: string) => {
    setReferences((prev) => prev.filter((ref) => ref.key !== fieldKey));
  }, []);

  const hasFieldReference = useCallback(
    (fieldKey: string): boolean => {
      return references.some((ref) => ref.key === fieldKey);
    },
    [references],
  );

  const handleProceedToPreview = useCallback(
    (formData: IFormData) => {
      const formValue = formData[itemConfig.key];
      const isApplicableFalse =
        itemConfig.showApplicable && !fieldApplicability[itemConfig.key];
      const valueToSubmit = isApplicableFalse ? '' : formValue;
      const referenceValue = getFieldReference(itemConfig.key)?.value || '';

      setDataForPreviewOrSubmit({
        value: valueToSubmit,
        ref: referenceValue,
        reason: editReason,
      });
      setSubmissionStep('preview');
    },
    [itemConfig, fieldApplicability, getFieldReference, editReason],
  );

  const triggerActualAPISubmission = useCallback(() => {
    if (!dataForPreviewOrSubmit) return;

    const payload = {
      projectId: Number(projectId),
      key: itemKey,
      value: dataForPreviewOrSubmit.value,
      ref: dataForPreviewOrSubmit.ref,
      reason: dataForPreviewOrSubmit.reason,
    };
    devLog('createItemProposal payload', payload);
    createItemProposalMutation.mutate(payload, {
      onSuccess: (data) => {
        devLog('createItemProposal success', data);
        refetchProposalsByKey();
        setSubmissionStep('success');
      },
      onError: (error: any) => {
        console.error('createItemProposal error', error);
      },
    });
  }, [
    dataForPreviewOrSubmit,
    createItemProposalMutation,
    itemKey,
    projectId,
    refetchProposalsByKey,
  ]);

  useEffect(() => {
    if (submissionStep === 'success') {
      return;
    }

    devLog(
      `useEffect [SubmitItemProposal-${itemKey}]: Populating form. Current step: ${submissionStep}`,
    );

    if (displayProposalDataOfKey && displayProposalDataOfKey.key === itemKey) {
      devLog(
        `useEffect [SubmitItemProposal-${itemKey}]: Using displayProposalDataOfKey:`,
        displayProposalDataOfKey,
      );
      setValue(itemConfig.key, displayProposalDataOfKey.input);
      if (displayProposalDataOfKey.reference) {
        setReferences([
          {
            key: displayProposalDataOfKey.reference.key,
            value: displayProposalDataOfKey.reference.value,
            ref: '',
          },
        ]);
      } else {
        setReferences((prev) =>
          prev.filter(
            (ref) =>
              ref.key !== itemConfig.key &&
              (!displayProposalDataOfKey ||
                ref.key !== displayProposalDataOfKey.key),
          ),
        );
      }
    } else {
      devLog(
        `useEffect [SubmitItemProposal-${itemKey}]: Using default values.`,
      );
      const defaultValue = formState.defaultValues?.[itemConfig.key] ?? '';
      setValue(itemConfig.key, defaultValue);
      setReferences([]);
      setEditReason('');
    }
  }, [
    itemKey,
    displayProposalDataOfKey,
    submissionStep,
    setValue,
    itemConfig,
    formState.defaultValues,
  ]);

  return (
    <FormProvider {...methods}>
      {submissionStep === 'form' && (
        <form onSubmit={handleSubmit(handleProceedToPreview)}>
          <div className="flex flex-col gap-[20px] p-[20px]">
            <FormItemManager
              itemConfig={itemConfig as IItemConfig<keyof IProjectFormData>}
              control={control}
              fieldApplicability={fieldApplicability}
              onChangeApplicability={handleApplicabilityChange}
              onAddReference={handleAddReference}
              hasFieldReference={hasFieldReference}
            />

            <EditReasonUIContainer
              label="Edit Reason"
              description="Add a reason for the edit."
            >
              <Input
                value={editReason}
                onValueChange={setEditReason}
                placeholder="Edit reason"
              />
            </EditReasonUIContainer>

            <div>
              <Button
                color="primary"
                type="submit"
                isLoading={false}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </div>
        </form>
      )}

      {submissionStep === 'preview' && dataForPreviewOrSubmit && (
        <PreviewComponent
          data={dataForPreviewOrSubmit}
          itemConfig={itemConfig as IItemConfig<any>}
          onConfirmSubmit={triggerActualAPISubmission}
          onGoBack={() => {
            setSubmissionStep('form');
          }}
          isSubmitting={createItemProposalMutation.isPending}
        />
      )}

      {submissionStep === 'success' && dataForPreviewOrSubmit && (
        <SuccessComponent
          data={dataForPreviewOrSubmit}
          itemConfig={itemConfig as IItemConfig<any>}
          onClose={() => {
            setModalContentType(null);
          }}
          onViewSubmission={() => {
            devLog('View submission clicked - closing modal');
            setModalContentType(null);
          }}
        />
      )}

      <AddReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        onAddReference={handleSaveReference}
        onRemoveReference={handleRemoveReference}
        fieldKey={currentReferenceField.key}
        fieldLabel={currentReferenceField.label}
        existingReference={currentReferenceField.existingReference}
      />
    </FormProvider>
  );
};

const PreviewComponent: FC<{
  data: { value: any; ref: string; reason: string };
  itemConfig: IItemConfig<any>;
  onConfirmSubmit: () => void;
  onGoBack: () => void;
  isSubmitting: boolean;
}> = ({ data, itemConfig, onConfirmSubmit, onGoBack, isSubmitting }) => {
  const tableData = useMemo(
    () => itemDataToTableRows(data, itemConfig),
    [data, itemConfig],
  );
  const table = useReactTable({
    data: tableData,
    columns: sharedTableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4 p-5">
      <h3 className="text-xl font-semibold">
        Review your edit for {itemConfig.label}
      </h3>
      <p className="text-sm text-gray-600">
        Check your edit carefully before submission. This action is not
        re-doable.
      </p>

      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#F5F5F5]">
                {headerGroup.headers.map((header, index) => (
                  <TableHeader
                    key={header.id}
                    width={header.getSize()}
                    isLast={index === headerGroup.headers.length - 1}
                    className="h-auto border-b border-l-0 border-r border-black/10 bg-[#F5F5F5] px-2.5 py-3"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHeader>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    width={cell.column.getSize()}
                    isLast={cellIndex === row.getVisibleCells().length - 1}
                    isLastRow={rowIndex === table.getRowModel().rows.length - 1}
                    className="border-b border-l-0 border-r border-black/10 px-2.5 py-2 align-top"
                    minHeight={40}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          color="secondary"
          onClick={onGoBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          color="primary"
          onClick={onConfirmSubmit}
          isLoading={isSubmitting}
          className="flex-1"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

const SuccessComponent: FC<{
  data: { value: any; ref: string; reason: string };
  itemConfig: IItemConfig<any>;
  onClose: () => void;
  onViewSubmission: () => void;
}> = ({ data, itemConfig, onClose, onViewSubmission }) => {
  const tableData = useMemo(
    () => itemDataToTableRows(data, itemConfig, true),
    [data, itemConfig],
  );
  const table = useReactTable({
    data: tableData,
    columns: sharedTableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col items-center gap-[20px] p-[20px]">
      <div className="flex items-center gap-2 text-green-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <h2 className="text-lg font-semibold">Your proposal is submitted</h2>
      </div>

      <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#F5F5F5]">
                {headerGroup.headers.map((header, index) => (
                  <TableHeader
                    key={header.id}
                    width={header.getSize()}
                    isLast={index === headerGroup.headers.length - 1}
                    className="h-auto border-b border-l-0 border-r border-black/10 bg-[#F5F5F5] px-2.5 py-3"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHeader>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    width={cell.column.getSize()}
                    isLast={cellIndex === row.getVisibleCells().length - 1}
                    isLastRow={rowIndex === table.getRowModel().rows.length - 1}
                    className="border-b border-l-0 border-r border-black/10  px-2.5 py-2 align-top"
                    minHeight={40}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full gap-4">
        <Button color="secondary" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button color="primary" onClick={onViewSubmission} className="flex-1">
          View Your Submission
        </Button>
      </div>
    </div>
  );
};

export default SubmitItemProposal;
