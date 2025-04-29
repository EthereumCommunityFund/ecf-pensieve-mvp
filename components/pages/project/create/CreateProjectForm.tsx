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
import { useFormScrollToError } from '@/hooks/useFormScrollToError';
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
  const { scrollToError } = useFormScrollToError();

  const [currentStep, setCurrentStep] = useState<CreateProjectStep>(
    CreateProjectStep.Basics,
  );
  const [stepStatuses, setStepStatuses] = useState<
    Record<CreateProjectStep, StepStatus>
  >(DEFAULT_STEP_STATUSES);

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

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

  const stepsOrder = useMemo(
    () => [
      CreateProjectStep.Basics,
      CreateProjectStep.Dates,
      CreateProjectStep.Technicals,
      CreateProjectStep.Organization,
    ],
    [],
  );

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

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentStepFieldList = stepFields[currentStep];
    const applicableFieldsToValidate = getApplicableFields([
      ...currentStepFieldList,
    ]);

    const isStepValid =
      applicableFieldsToValidate.length > 0
        ? await trigger(applicableFieldsToValidate)
        : true;

    if (!isStepValid) {
      scrollToError(errors);
      addToast({
        title: 'Validation Error',
        description:
          'Please fix the errors in the current step before proceeding',
        color: 'warning',
        timeout: 2000,
      });
    }

    return isStepValid;
  }, [currentStep, getApplicableFields, trigger, errors, scrollToError]);

  const updateStepStatuses = useCallback(
    (
      currentStep: CreateProjectStep,
      targetStep: CreateProjectStep,
      isMovingForward: boolean,
    ) => {
      setStepStatuses((prev) => {
        const newStatuses = { ...prev };
        const currentStatus = prev[currentStep];
        const targetStatus = prev[targetStep];
        const targetStepIndex = stepsOrder.indexOf(targetStep);

        if (isMovingForward) {
          newStatuses[currentStep] = 'Finished';
        } else {
          newStatuses[currentStep] =
            currentStatus === 'Finished' ? 'Finished' : 'Inactive';
        }

        newStatuses[targetStep] =
          targetStatus === 'Finished' ? 'Finished' : 'Active';

        if (isMovingForward) {
          stepsOrder.forEach((stepKey, index) => {
            if (index > targetStepIndex) {
              newStatuses[stepKey] =
                prev[stepKey] === 'Finished' ? 'Finished' : 'Inactive';
            }
          });
        }

        return newStatuses;
      });
    },
    [stepsOrder],
  );

  const handleNext = useCallback(async () => {
    devLog('Form Data (handleNext)', getValues());
    devLog(
      'Transformed Data (handleNext)',
      transformProjectData(getValues(), references, fieldApplicability),
    );

    const isStepValid = await validateCurrentStep();
    if (!isStepValid) return;

    const currentIndex = stepsOrder.indexOf(currentStep);

    if (currentIndex < stepsOrder.length - 1) {
      const nextStep = stepsOrder[currentIndex + 1];
      updateStepStatuses(currentStep, nextStep, true);
      setCurrentStep(nextStep);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      return;
    }

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
      scrollToError(errors);
      addToast({
        title: 'Validation Error',
        description:
          'Please review all steps and ensure required fields are filled',
        color: 'warning',
        timeout: 2000,
      });
    }
  }, [
    currentStep,
    validateCurrentStep,
    stepsOrder,
    updateStepStatuses,
    onSubmit,
    trigger,
    getValues,
    fieldApplicability,
    errors,
    scrollToError,
  ]);

  const handleBack = useCallback(() => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = stepsOrder[currentIndex - 1];
      updateStepStatuses(currentStep, prevStep, false);
      setCurrentStep(prevStep);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  }, [currentStep, stepsOrder, updateStepStatuses]);

  const handleGoToStep = useCallback(
    async (targetStep: CreateProjectStep) => {
      if (targetStep === currentStep) {
        return;
      }

      const currentStepIndex = stepsOrder.indexOf(currentStep);
      const targetStepIndex = stepsOrder.indexOf(targetStep);
      const isMovingBackward = targetStepIndex < currentStepIndex;

      if (isMovingBackward) {
        updateStepStatuses(currentStep, targetStep, false);
        setCurrentStep(targetStep);
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
        return;
      }

      const isCurrentStepValid = await validateCurrentStep();
      if (!isCurrentStepValid) return;

      updateStepStatuses(currentStep, targetStep, true);
      setCurrentStep(targetStep);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    },
    [currentStep, validateCurrentStep, stepsOrder, updateStepStatuses],
  );

  const handleDiscard = useCallback(() => {
    setIsDiscardModalOpen(true);
  }, []);

  const confirmDiscard = useCallback(() => {
    reset();
    setReferences([]);
    setCurrentStep(CreateProjectStep.Basics);
    setStepStatuses(DEFAULT_STEP_STATUSES);
    setIsDiscardModalOpen(false);
    router.push('/projects');
  }, [reset, router]);

  const hasFieldReference = useCallback(
    (fieldKey: string): boolean => {
      return references.some((ref) => ref.key === fieldKey);
    },
    [references],
  );

  const getFieldReference = useCallback(
    (fieldKey: string): ReferenceData | null => {
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

  const handleSaveReference = useCallback((reference: ReferenceData) => {
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

  const handleRemoveReference = useCallback(
    (fieldKey: string) => {
      const fieldLabel =
        references.find((ref) => ref.key === fieldKey)?.key || fieldKey;

      setReferences((prev) => prev.filter((ref) => ref.key !== fieldKey));
    },
    [references],
  );

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
