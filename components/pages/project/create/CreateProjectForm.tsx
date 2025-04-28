'use client';

import { addToast } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  ApplicableField,
  DEFAULT_CREATE_PROJECT_FORM_DATA,
  DEFAULT_FIELD_APPLICABILITY,
} from '@/components/pages/project/create/FormData';
import { transformProjectData } from '@/components/pages/project/create/utils/form';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { devLog } from '@/utils/devLog';

import AddReferenceModal from './AddReferenceModal';
import DiscardConfirmModal from './DiscardConfirmModal';
import FormActions from './FormActions';
import StepNavigation, { StepHeader } from './StepNavigation';
import StepWrapper from './StepWrapper';
import BasicsStepForm from './steps/BasicsStepForm';
import DatesStepForm from './steps/DatesStepForm';
import OrganizationStepForm from './steps/OrganizationStepForm';
import TechnicalsStepForm from './steps/TechnicalsStepForm';
import {
  CreateProjectStep,
  ProjectFormData,
  ReferenceData,
  stepFields,
  StepStatus,
} from './types';
import { FieldApplicabilityContext, projectSchema } from './validation';

dayjs.extend(utc);

// Default step statuses
const DEFAULT_STEP_STATUSES: Record<CreateProjectStep, StepStatus> = {
  [CreateProjectStep.Basics]: 'Active',
  [CreateProjectStep.Dates]: 'Inactive',
  [CreateProjectStep.Technicals]: 'Inactive',
  [CreateProjectStep.Organization]: 'Inactive',
};

const CreateProjectForm: React.FC = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const createProjectMutation = trpc.project.createProject.useMutation();

  // Step status management
  const [currentStep, setCurrentStep] = useState<CreateProjectStep>(
    CreateProjectStep.Basics,
  );
  const [stepStatuses, setStepStatuses] = useState<
    Record<CreateProjectStep, StepStatus>
  >(DEFAULT_STEP_STATUSES);

  // Modal states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  // References and field applicability states
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [currentReferenceField, setCurrentReferenceField] = useState({
    key: '',
    label: '',
    existingReference: null as ReferenceData | null,
  });
  const [fieldApplicability, setFieldApplicability] = useState<
    Record<ApplicableField, boolean>
  >(DEFAULT_FIELD_APPLICABILITY);

  const methods = useForm<ProjectFormData>({
    resolver: yupResolver<
      ProjectFormData,
      FieldApplicabilityContext,
      ProjectFormData
    >(projectSchema, { context: fieldApplicability }),
    mode: 'all',
    defaultValues: DEFAULT_CREATE_PROJECT_FORM_DATA,
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    setError,
    control,
    watch,
    setValue,
  } = methods;

  // Step order
  const stepsOrder = useMemo(
    () => [
      CreateProjectStep.Basics,
      CreateProjectStep.Dates,
      CreateProjectStep.Technicals,
      CreateProjectStep.Organization,
    ],
    [],
  );

  /**
   * Get applicable fields for the current step
   */
  const getApplicableFields = useCallback(
    (stepFields: readonly string[]) => {
      return stepFields.filter((field) => {
        if (field in fieldApplicability) {
          return fieldApplicability[field as ApplicableField];
        }
        return true;
      }) as (keyof ProjectFormData)[];
    },
    [fieldApplicability],
  );

  /**
   * Form submission handler
   */
  const onSubmit = useCallback(
    async (formData: ProjectFormData) => {
      if (!profile?.userId) {
        addToast({
          title: 'Error',
          description: 'User not authenticated',
          color: 'danger',
          timeout: 2000,
        });
        return;
      }

      const payload = transformProjectData(
        formData,
        references,
        fieldApplicability,
      );

      // 开发环境日志
      devLog('Payload (onSubmit)', payload);

      createProjectMutation.mutate(payload, {
        onSuccess: () => {
          addToast({
            title: 'Success',
            description: 'Project created successfully!',
            color: 'success',
            timeout: 2000,
          });
          router.push('/projects');
        },
        onError: (error: any) => {
          if (error?.data?.zodError?.fieldErrors) {
            const fieldErrors = error.data.zodError.fieldErrors;
            Object.entries(fieldErrors).forEach(([field, messages]) => {
              setError(field as keyof ProjectFormData, {
                type: 'server',
                message: Array.isArray(messages)
                  ? messages[0]
                  : String(messages),
              });
            });
            addToast({
              title: 'Validation Error',
              description: 'Please check the highlighted fields',
              color: 'warning',
              timeout: 2000,
            });
          } else {
            addToast({
              title: 'Submission Failed',
              description:
                error?.message ||
                'An unexpected error occurred, please try again',
              color: 'danger',
              timeout: 2000,
            });
          }
        },
      });
    },
    [
      profile?.userId,
      references,
      fieldApplicability,
      createProjectMutation,
      router,
      setError,
    ],
  );

  /**
   * Proceed to next step or submit form
   */
  const handleNext = useCallback(async () => {
    devLog('Form Data (handleNext)', getValues());
    devLog(
      'Transformed Data (handleNext)',
      transformProjectData(getValues(), references, fieldApplicability),
    );

    const currentStepFieldList = stepFields[currentStep];
    const applicableFieldsToValidate = getApplicableFields([
      ...currentStepFieldList,
    ]);

    // Validate current step
    const isStepValid =
      applicableFieldsToValidate.length > 0
        ? await trigger(applicableFieldsToValidate)
        : true;

    if (!isStepValid) {
      addToast({
        title: 'Validation Error',
        description: 'Please check the highlighted fields in the current step',
        color: 'warning',
        timeout: 2000,
      });
      return;
    }

    const currentIndex = stepsOrder.indexOf(currentStep);

    // If not the last step, proceed to next step
    if (currentIndex < stepsOrder.length - 1) {
      const nextStep = stepsOrder[currentIndex + 1];
      setStepStatuses((prev) => ({
        ...prev,
        [currentStep]: 'Finished',
        [nextStep]: 'Active',
      }));
      setCurrentStep(nextStep);

      // Scroll to top
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      return;
    }

    // Last step, perform final validation
    const allFormFields = Object.keys(getValues()) as (keyof ProjectFormData)[];
    const fieldsToValidateFinally = allFormFields.filter((field) => {
      if (field in fieldApplicability) {
        return fieldApplicability[field as ApplicableField];
      }
      return true;
    });

    const isFinalValidationValid = await trigger(fieldsToValidateFinally);

    if (isFinalValidationValid) {
      await onSubmit(getValues());
    } else {
      addToast({
        title: 'Validation Error',
        description:
          'Please review all steps and ensure required fields are filled',
        color: 'warning',
      });
    }
  }, [
    currentStep,
    getApplicableFields,
    onSubmit,
    stepsOrder,
    trigger,
    getValues,
    fieldApplicability,
    references,
  ]);

  /**
   * Go back to previous step
   */
  const handleBack = useCallback(() => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = stepsOrder[currentIndex - 1];
      setStepStatuses((prev) => ({
        ...prev,
        [currentStep]: 'Inactive',
        [prevStep]: 'Active',
      }));
      setCurrentStep(prevStep);
    }
  }, [currentStep, stepsOrder]);

  /**
   * Jump to a specific step (only finished steps)
   */
  const handleGoToStep = useCallback(
    (step: CreateProjectStep) => {
      if (stepStatuses[step] === 'Finished') {
        setStepStatuses((prev) => ({
          ...prev,
          [currentStep]: 'Inactive',
          [step]: 'Active',
        }));
        setCurrentStep(step);
      }
    },
    [currentStep, stepStatuses],
  );

  /**
   * Discard form
   */
  const handleDiscard = useCallback(() => {
    setIsDiscardModalOpen(true);
  }, []);

  /**
   * Confirm discard form
   */
  const confirmDiscard = useCallback(() => {
    reset();
    setReferences([]);
    setCurrentStep(CreateProjectStep.Basics);
    setStepStatuses(DEFAULT_STEP_STATUSES);
    setIsDiscardModalOpen(false);
    router.push('/projects');
  }, [reset, router]);

  /**
   * Check if a field has a reference
   */
  const hasFieldReference = useCallback(
    (fieldKey: string): boolean => {
      return references.some((ref) => ref.key === fieldKey);
    },
    [references],
  );

  /**
   * Get field reference
   */
  const getFieldReference = useCallback(
    (fieldKey: string): ReferenceData | null => {
      return references.find((ref) => ref.key === fieldKey) || null;
    },
    [references],
  );

  /**
   * Add field reference
   */
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

  /**
   * Save field reference
   */
  const handleSaveReference = useCallback(
    (reference: ReferenceData) => {
      setReferences((prev) => {
        const existingIndex = prev.findIndex(
          (ref) => ref.key === reference.key,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = reference;
          return updated;
        }
        return [...prev, reference];
      });
    },
    [currentReferenceField.label],
  );

  /**
   * Remove field reference
   */
  const handleRemoveReference = useCallback(
    (fieldKey: string) => {
      const fieldLabel =
        references.find((ref) => ref.key === fieldKey)?.key || fieldKey;

      setReferences((prev) => prev.filter((ref) => ref.key !== fieldKey));
    },
    [references],
  );

  /**
   * Change field applicability
   */
  const handleApplicabilityChange = useCallback(
    (field: ApplicableField, value: boolean) => {
      setFieldApplicability((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const stepProps = {
    control,
    errors,
    watch,
    setValue,
    trigger,
    fieldApplicability,
    onChangeApplicability: handleApplicabilityChange,
    onAddReference: handleAddReference,
    onRemoveReference: handleRemoveReference,
    hasFieldReference,
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-screen gap-[40px] px-[160px] pb-[40px] tablet:gap-[20px] tablet:px-[20px] mobile:flex-col mobile:gap-[20px] mobile:px-0 mobile:pt-0"
      >
        <StepNavigation
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          goToStep={handleGoToStep}
        />
        <div className="flex flex-1 flex-col gap-[40px] mobile:gap-[20px]">
          <StepHeader currentStep={currentStep} />

          <div className="flex flex-col gap-[20px] mobile:px-[14px]">
            <StepWrapper
              stepId={CreateProjectStep.Basics}
              currentStep={currentStep}
            >
              <BasicsStepForm {...stepProps} />
            </StepWrapper>
            <StepWrapper
              stepId={CreateProjectStep.Dates}
              currentStep={currentStep}
            >
              <DatesStepForm {...stepProps} />
            </StepWrapper>
            <StepWrapper
              stepId={CreateProjectStep.Technicals}
              currentStep={currentStep}
            >
              <TechnicalsStepForm {...stepProps} />
            </StepWrapper>
            <StepWrapper
              stepId={CreateProjectStep.Organization}
              currentStep={currentStep}
            >
              <OrganizationStepForm {...stepProps} />
            </StepWrapper>

            <FormActions
              currentStep={currentStep}
              isSubmitting={createProjectMutation.isPending || isSubmitting}
              onBack={handleBack}
              onNext={handleNext}
              onDiscard={handleDiscard}
            />
          </div>
        </div>
      </form>

      <DiscardConfirmModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={confirmDiscard}
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

export default CreateProjectForm;
