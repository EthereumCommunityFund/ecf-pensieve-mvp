import { cn } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { IModalContentType } from '@/app/project/[id]/page';
import { addToast } from '@/components/base';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';
import {
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc/client';
import { IItemConfig, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { createItemValidationSchema } from '@/utils/schema';

import { useProjectDetailContext } from '../../context/projectDetailContext';
import AddReferenceModal from '../../create/AddReferenceModal';
import { DefaultFieldApplicabilityMap } from '../../create/form/FormData';
import { IProjectTableRowData } from '../types';

import BackButton from './BackButton';
import EditReasonUIContainer from './EditReasonUIContainer';
import PreviewStep from './PreviewStep';
import SuccessStep from './SuccessStep';

export interface IDataForPreview {
  value: any;
  ref: string;
  reason: string;
}

export interface ISubmitItemProposalProps {
  itemKey: IPocItemKey;
  displayProposalDataOfKey?: IProjectTableRowData;
  setModalContentType: (contentType: IModalContentType) => void;
  onClose: () => void;
  onBackToSubmissionQueue: () => void;
}

interface IFormData extends IProjectFormData {
  [key: string]: any;
}

const SubmitItemProposal: FC<ISubmitItemProposalProps> = ({
  itemKey,
  displayProposalDataOfKey,
  setModalContentType,
  onClose,
  onBackToSubmissionQueue,
}) => {
  const { id: projectId } = useParams();
  const { refetchAll } = useProjectDetailContext();

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

  const [expandedRows, setExpandedRows] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});

  const toggleRowExpanded = useCallback((key: IPocItemKey) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const itemConfig = useMemo(
    () => AllItemConfig[itemKey as IPocItemKey]!,
    [itemKey],
  );

  const methods = useForm<IFormData>({
    defaultValues: {
      [itemConfig.key]: '',
    },
    mode: 'all',
    resolver: yupResolver(createItemValidationSchema(itemKey)),
  });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState,
    trigger,
    getValues,
  } = methods;

  const [editReason, setEditReason] = useState('');
  const [submissionStep, setSubmissionStep] = useState<
    'form' | 'preview' | 'success'
  >('form');

  const [dataForPreview, setDataForPreview] = useState<IDataForPreview>({
    value: '',
    ref: '',
    reason: '',
  });

  const createItemProposalMutation =
    trpc.itemProposal.createItemProposal.useMutation();

  const getApplicableFields = useCallback(
    (fields: string[]) => {
      return fields.filter((field) => {
        if (field in fieldApplicability) {
          return fieldApplicability[field];
        }
        return true;
      });
    },
    [fieldApplicability],
  );

  const validateFields = useCallback(async (): Promise<boolean> => {
    const fieldsToValidate = getApplicableFields([itemConfig.key]);

    const isValid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;

    if (!isValid) {
      addToast({
        title: 'Validation Error',
        description: 'Please fix the errors before proceeding',
        color: 'warning',
      });
    }

    return isValid;
  }, [itemConfig.key, getApplicableFields, trigger]);

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
    async (formData: IFormData) => {
      const isValid = await validateFields();
      if (!isValid) return;

      const formValue = formData[itemConfig.key];
      const isApplicableFalse =
        itemConfig.showApplicable && !fieldApplicability[itemConfig.key];

      // Convert date values to UTC for consistent backend storage
      let valueToSubmit = isApplicableFalse ? '' : formValue;
      if (itemConfig.formDisplayType === 'date' && formValue instanceof Date) {
        valueToSubmit = dayjs
          .utc(dayjs(formValue).format('YYYY-MM-DD'))
          .toISOString();
      }

      const referenceValue = getFieldReference(itemConfig.key)?.value || '';

      setDataForPreview({
        value: valueToSubmit,
        ref: referenceValue,
        reason: editReason || '',
      });
      setSubmissionStep('preview');
    },
    [
      itemConfig,
      fieldApplicability,
      getFieldReference,
      editReason,
      validateFields,
    ],
  );

  const onNext = useCallback(() => {
    handleProceedToPreview(getValues());
  }, [handleProceedToPreview, getValues]);

  const triggerActualAPISubmission = useCallback(() => {
    if (!dataForPreview) return;

    const payload = {
      projectId: Number(projectId),
      key: itemKey,
      value: dataForPreview.value,
      ref: dataForPreview.ref,
      reason: dataForPreview.reason,
    };
    devLog('createItemProposal payload', payload);
    createItemProposalMutation.mutate(payload, {
      onSuccess: (data) => {
        devLog('createItemProposal success', data);
        setSubmissionStep('success');
        refetchAll();
      },
      onError: (error: any) => {
        console.error('createItemProposal error', error);
      },
    });
  }, [
    dataForPreview,
    createItemProposalMutation,
    itemKey,
    projectId,
    refetchAll,
  ]);

  useEffect(() => {
    if (submissionStep === 'success') {
      return;
    }

    if (displayProposalDataOfKey && displayProposalDataOfKey.key === itemKey) {
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

  const clearStatus = useCallback(() => {
    setSubmissionStep('form');
    setEditReason('');
    setDataForPreview({
      value: '',
      ref: '',
      reason: '',
    });
  }, []);

  const onCloseModal = useCallback(() => {
    clearStatus();
    onClose();
  }, [onClose, clearStatus]);

  const onViewProposal = useCallback(() => {
    clearStatus();
    onBackToSubmissionQueue();
  }, [onBackToSubmissionQueue, clearStatus]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleProceedToPreview)}
        className={cn(submissionStep === 'form' ? 'block' : 'hidden')}
      >
        <div className="flex flex-col gap-[20px] p-[20px]">
          <div className="flex justify-start">
            <BackButton onPress={onBackToSubmissionQueue} />
          </div>

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
              isLoading={false}
              className="w-full"
              onPress={onNext}
            >
              Next
            </Button>
          </div>
        </div>
      </form>

      <PreviewStep
        isShow={submissionStep === 'preview' && !!dataForPreview}
        data={dataForPreview}
        itemKey={itemKey}
        onConfirmSubmit={triggerActualAPISubmission}
        onGoBack={() => {
          setSubmissionStep('form');
        }}
        isSubmitting={createItemProposalMutation.isPending}
        expandedRows={expandedRows}
        toggleRowExpanded={toggleRowExpanded}
      />

      <SuccessStep
        isNewItem={
          displayProposalDataOfKey === null && !!itemConfig.isEssential
        }
        isShow={submissionStep === 'success' && !!dataForPreview}
        data={dataForPreview}
        itemKey={itemKey}
        onClose={onCloseModal}
        onViewSubmission={onViewProposal}
        expandedRows={expandedRows}
        toggleRowExpanded={toggleRowExpanded}
      />

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

export default SubmitItemProposal;
