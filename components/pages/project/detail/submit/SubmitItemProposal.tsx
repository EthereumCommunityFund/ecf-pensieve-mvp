import { cn } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { IModalContentType } from '@/app/project/[id]/page';
import { addToast } from '@/components/base';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';
import {
  IFormTypeEnum,
  IProjectFormData,
  IReferenceData,
} from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc/client';
import { IPocItemKey } from '@/types/item';
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

  const defaultFormValues = useMemo(() => {
    const defaultValue =
      itemConfig.formDisplayType === 'founderList'
        ? [{ name: '', title: '', region: '' }]
        : '';
    return { [itemConfig.key]: defaultValue };
  }, [itemConfig.key, itemConfig.formDisplayType]);

  const methods = useForm<IFormData>({
    defaultValues: defaultFormValues,
    mode: 'onSubmit', // Key: Use onSubmit to avoid validation on onChange
    reValidateMode: 'onSubmit', // Key: Re-validation also only occurs on submit
    criteriaMode: 'all',
    shouldUnregister: false, // Key: Prevent field unregistration
    shouldFocusError: false, // Key: Prevent side effects on focus
    shouldUseNativeValidation: false, // Key: Disable native validation
    // Re-enable yupResolver with safer configuration
    resolver: yupResolver(createItemValidationSchema(itemKey), {
      abortEarly: false,
      stripUnknown: false,
    }),
  });

  const { control, clearErrors, reset, handleSubmit, watch, getValues } =
    methods;

  // Watch form values
  const watchedValues = watch();

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

  // Optimized version based on React Hook Form source code analysis
  const validateAndProceed = useCallback(
    (formData: IFormData) => {
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

      // For founderList, ensure we always get the current form data, not any cached data
      if (
        itemConfig.formDisplayType === 'founderList' &&
        Array.isArray(valueToSubmit)
      ) {
        // Create a clean copy of the founders data to avoid reference issues
        valueToSubmit = valueToSubmit.map((founder: any) => ({
          name: founder.name || '',
          title: founder.title || '',
          region: founder.region || '',
        }));
      }

      const referenceValue = getFieldReference(itemConfig.key)?.value || '';

      const dataForPreview = {
        value: valueToSubmit,
        ref: referenceValue,
        reason: editReason || '',
      };

      setDataForPreview(dataForPreview);
      setSubmissionStep('preview');
    },
    [
      itemConfig,
      fieldApplicability,
      getFieldReference,
      editReason,
      displayProposalDataOfKey,
    ],
  );

  // After re-enabling yupResolver, remove custom validation logic

  // Use standard React Hook Form handleSubmit with yupResolver
  const onSubmit = useCallback(
    (data: IFormData) => {
      validateAndProceed(data);
    },
    [validateAndProceed, getValues],
  );

  const onError = useCallback((errors: any) => {
    addToast({
      title: 'Validation Error',
      description: 'Please fix the errors before proceeding',
      color: 'warning',
    });
  }, []);

  const triggerActualAPISubmission = useCallback(() => {
    if (!dataForPreview) return;

    const payload = {
      projectId: Number(projectId),
      key: itemKey,
      value: dataForPreview.value,
      ref: dataForPreview.ref,
      reason: dataForPreview.reason,
    };
    createItemProposalMutation.mutate(payload, {
      onSuccess: (data) => {
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

  // Use useRef to track form initialization state
  const isFormInitialized = useRef(false);
  const lastItemKey = useRef<string | null>(null);
  const lastDisplayDataKey = useRef<string | null>(null);

  // Use useRef to stabilize function references, avoiding useEffect triggers when setting errors
  const resetRef = useRef(reset);
  const clearErrorsRef = useRef(clearErrors);

  // Update function references in refs
  resetRef.current = reset;
  clearErrorsRef.current = clearErrors;

  useEffect(() => {
    // Check if form initialization is needed
    const isNewItemKey = lastItemKey.current !== itemKey;
    const hasDataForCurrentItem =
      displayProposalDataOfKey && displayProposalDataOfKey.key === itemKey;
    const currentDataKey = displayProposalDataOfKey?.key || null;
    const isNewData = lastDisplayDataKey.current !== currentDataKey;

    // Initialize form in these cases:
    // 1. Form has never been initialized
    // 2. Switching to a different itemKey
    // 3. Data has changed (from no data to data, or data content changed)
    const shouldInitialize =
      !isFormInitialized.current ||
      isNewItemKey ||
      (isNewData && hasDataForCurrentItem);

    if (!shouldInitialize) {
      return;
    }

    // Update tracking variables
    lastItemKey.current = itemKey;
    lastDisplayDataKey.current = currentDataKey;
    isFormInitialized.current = true;

    clearErrorsRef.current(); // Clear all error states

    // CRITICAL FIX: Always use default values for new proposals to prevent data contamination
    // NEVER use displayProposalDataOfKey in SubmitItemProposal - this is for creating NEW proposals
    // The displayProposalDataOfKey is meant for viewing existing proposals, not creating new ones
    const isEditingExistingProposal = false;

    if (isEditingExistingProposal) {
      // Handle existing data
      let valueToSet = displayProposalDataOfKey?.input;

      // For founderList type, ensure value is in array format
      if (itemConfig.formDisplayType === 'founderList') {
        if (typeof valueToSet === 'string') {
          try {
            // Try to parse JSON string
            valueToSet = JSON.parse(valueToSet);
          } catch (error) {
            // If parsing fails, set to default value instead of empty array
            valueToSet = [{ name: '', title: '', region: '' }];
          }
        }

        // Ensure array format, if not array or empty array, set default value
        if (!Array.isArray(valueToSet) || valueToSet.length === 0) {
          valueToSet = [{ name: '', title: '', region: '' }];
        }
      }

      // Use reset to set entire form values, ensuring all fields are correctly updated
      resetRef.current({
        [itemConfig.key]: valueToSet,
      });
      setReferences([]);
    } else {
      const defaultValue =
        itemConfig.formDisplayType === 'founderList'
          ? [{ name: '', title: '', region: '' }]
          : '';
      resetRef.current({
        [itemConfig.key]: defaultValue,
      });
      setReferences([]);
      setEditReason('');
    }
  }, [
    itemKey,
    displayProposalDataOfKey, // Add this dependency to ensure form re-initialization after data loads
    itemConfig.formDisplayType,
    itemConfig.key,
  ]);

  // Removed field value monitoring as new validation method doesn't clear field values, backup mechanism no longer needed

  const clearStatus = useCallback(() => {
    setSubmissionStep('form');
    setEditReason('');
    setDataForPreview({
      value: '',
      ref: '',
      reason: '',
    });
    clearErrors(); // Clear all error states
    reset();

    // Reset form initialization state, will re-initialize when modal opens next time
    isFormInitialized.current = false;
    lastItemKey.current = null;
    lastDisplayDataKey.current = null;
  }, [reset, clearErrors]);

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
        onSubmit={handleSubmit(onSubmit, onError)}
        className={cn(submissionStep === 'form' ? 'block' : 'hidden')}
      >
        <div className="flex flex-col gap-[20px] p-[20px]">
          <div className="flex justify-start">
            <BackButton onPress={onBackToSubmissionQueue} />
          </div>

          <FormItemManager
            itemConfig={itemConfig as any}
            control={control}
            fieldApplicability={fieldApplicability}
            onChangeApplicability={handleApplicabilityChange}
            onAddReference={handleAddReference}
            hasFieldReference={hasFieldReference}
            formType={IFormTypeEnum.Project}
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
              type="submit"
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
