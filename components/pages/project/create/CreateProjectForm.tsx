'use client';

import { cn } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { addToast } from '@/components/base';
import { WarningDiamondIcon } from '@/components/icons';
import {
  DefaultFieldApplicabilityMap,
  getCreateProjectStepFields,
  getDefaultProjectFormData,
} from '@/components/pages/project/create/form/FormData';
import {
  transformProjectData,
  transformProposalData,
} from '@/components/pages/project/create/utils/form';
import { useAuth } from '@/context/AuthContext';
import { useFormScrollToError } from '@/hooks/useFormScrollToError';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { IItemCategoryEnum } from '@/types/item';
import { devLog } from '@/utils/devLog';

import AddReferenceModal from './AddReferenceModal';
import DiscardConfirmModal from './DiscardConfirmModal';
import FormActions from './form/FormActions';
import { projectSchema } from './form/validation';
import StepNavigation, {
  IItemCategoryEnumWithoutGovernance,
  StepHeader,
} from './StepNavigation';
import BasicsStepForm from './steps/BasicsStepForm';
import FinancialStepForm from './steps/FinancialStepForm';
import OrganizationStepForm from './steps/OrganizationStepForm';
import SubmittingStep from './steps/SubmittingStep';
import TechnicalsStepForm from './steps/TechnicalsStepForm';
import StepWrapper from './StepWrapper';
import {
  IFormTypeEnum,
  IProjectFormData,
  IReferenceData,
  IStepStatus,
} from './types';
import { updateFormWithProjectData } from './utils/form';

dayjs.extend(utc);

const DEFAULT_STEP_STATUSES: Record<
  IItemCategoryEnumWithoutGovernance,
  IStepStatus
> = {
  [IItemCategoryEnum.Basics]: 'Active',
  [IItemCategoryEnum.Technicals]: 'Inactive',
  [IItemCategoryEnum.Organization]: 'Inactive',
  [IItemCategoryEnum.Financial]: 'Inactive',
};

const STEPS_ORDER: IItemCategoryEnumWithoutGovernance[] = [
  IItemCategoryEnum.Basics,
  IItemCategoryEnum.Technicals,
  IItemCategoryEnum.Organization,
  IItemCategoryEnum.Financial,
];

interface CreateProjectFormProps {
  formType?: IFormTypeEnum;
  projectId?: number;
  onSubmit?: (data: IProjectFormData, references: IReferenceData[]) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  redirectPath?: string;
  projectData?: IProject;
}

type ApiSubmissionStatus = 'idle' | 'pending' | 'success' | 'error';

const DefaultProjectFormData = getDefaultProjectFormData();

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  formType = IFormTypeEnum.Project,
  projectId,
  onSubmit: externalOnSubmit,
  onSuccess: externalOnSuccess,
  onError: externalOnError,
  redirectPath,
  projectData,
}) => {
  const router = useRouter();
  const { profile, fetchUserProfile } = useAuth();
  const createProjectMutation = trpc.project.createProject.useMutation();
  const createProposalMutation = trpc.proposal.createProposal.useMutation();
  const { scrollToError } = useFormScrollToError();

  const isProjectType = formType === IFormTypeEnum.Project;

  const [currentStep, setCurrentStep] =
    useState<IItemCategoryEnumWithoutGovernance>(IItemCategoryEnum.Basics);
  const [stepStatuses, setStepStatuses] = useState<
    Record<IItemCategoryEnumWithoutGovernance, IStepStatus>
  >(DEFAULT_STEP_STATUSES);

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  const [references, setReferences] = useState<IReferenceData[]>([]);
  const [currentReferenceField, setCurrentReferenceField] = useState({
    key: '',
    label: '',
    existingReference: null as IReferenceData | null,
  });
  const [fieldApplicability, setFieldApplicability] = useState<
    Record<string, boolean>
  >(DefaultFieldApplicabilityMap);

  const [showSubmittingPage, setShowSubmittingPage] = useState(false);
  const [apiSubmissionStatus, setApiSubmissionStatus] =
    useState<ApiSubmissionStatus>('idle');
  const [createdEntityId, setCreatedEntityId] = useState<number | undefined>(
    undefined,
  );

  const methods = useForm<IProjectFormData>({
    resolver: yupResolver<
      IProjectFormData,
      Record<string, boolean>,
      IProjectFormData
    >(projectSchema),
    mode: 'onTouched', // Only validate after user interaction
    defaultValues: DefaultProjectFormData,
  });

  useEffect(() => {
    updateFormWithProjectData(
      formType,
      projectData,
      methods.setValue,
      setReferences,
    );
  }, [projectData, formType, methods.setValue, setReferences]);

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
    clearErrors,
  } = methods;

  const getApplicableFields = useCallback(
    (stepFields: readonly string[]) => {
      return stepFields.filter((field) => {
        if (field in fieldApplicability) {
          return fieldApplicability[field];
        }
        return true;
      }) as (keyof IProjectFormData)[];
    },
    [fieldApplicability],
  );

  const handleSubmissionError = useCallback(
    (error: any) => {
      if (error?.data?.zodError?.fieldErrors) {
        const fieldErrors = error.data.zodError.fieldErrors;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof IProjectFormData, {
            type: 'server',
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
        addToast({
          title: 'Validation Error',
          description: 'Please check the highlighted fields',
          color: 'warning',
        });
      } else {
        addToast({
          title: 'Submission Failed',
          description:
            error?.message || 'An unexpected error occurred, please try again',
          color: 'danger',
        });
      }
    },
    [setError],
  );

  const onSubmit = useCallback(
    async (formData: IProjectFormData) => {
      if (!profile?.userId) {
        addToast({
          title: 'Error',
          description: 'User not authenticated',
          color: 'danger',
        });
        return;
      }

      if (externalOnSubmit) {
        externalOnSubmit(formData, references);
        return;
      }

      const performSubmit = async () => {
        setApiSubmissionStatus('pending');
        setCreatedEntityId(undefined);

        if (formType === IFormTypeEnum.Project) {
          const payload = transformProjectData(
            formData,
            references,
            fieldApplicability,
          );

          devLog('Project Payload (onSubmit)', payload);

          createProjectMutation.mutate(payload, {
            onSuccess: (data) => {
              setApiSubmissionStatus('success');
              setCreatedEntityId(data?.id);
              fetchUserProfile();
            },
            onError: (error: any) => {
              setApiSubmissionStatus('error');
              setShowSubmittingPage(false);
              if (externalOnError) {
                externalOnError(error);
              } else {
                handleSubmissionError(error);
              }
            },
          });
        } else if (formType === IFormTypeEnum.Proposal) {
          if (!projectId) {
            addToast({
              title: 'Error',
              description: 'Project ID is required for creating a proposal',
              color: 'danger',
            });
            setApiSubmissionStatus('error');
            setShowSubmittingPage(false);
            return;
          }

          const payload = transformProposalData(
            formData,
            references,
            fieldApplicability,
            projectId,
          );

          devLog('Proposal Payload (onSubmit)', payload);

          createProposalMutation.mutate(payload, {
            onSuccess: (data) => {
              setApiSubmissionStatus('success');
              setCreatedEntityId(data?.id);
              fetchUserProfile();
            },
            onError: (error: any) => {
              setApiSubmissionStatus('error');
              setShowSubmittingPage(false);
              if (externalOnError) {
                externalOnError(error);
              } else {
                handleSubmissionError(error);
              }
            },
          });
        }
      };

      setShowSubmittingPage(true);
      setStepStatuses((prev) => ({
        ...prev,
        [currentStep]: 'Finished',
      }));
      requestAnimationFrame(() => {
        performSubmit();
      });
    },
    [
      profile?.userId,
      references,
      fieldApplicability,
      formType,
      projectId,
      createProjectMutation,
      createProposalMutation,
      externalOnSubmit,
      externalOnError,
      handleSubmissionError,
      currentStep,
      fetchUserProfile,
    ],
  );

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentStepFieldList = getCreateProjectStepFields(currentStep);
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
      });
    }

    return isStepValid;
  }, [currentStep, getApplicableFields, trigger, errors, scrollToError]);

  const updateStepStatuses = useCallback(
    (
      currentStep: IItemCategoryEnumWithoutGovernance,
      targetStep: IItemCategoryEnumWithoutGovernance,
      isMovingForward: boolean,
    ) => {
      setStepStatuses((prev) => {
        const newStatuses = { ...prev };
        const currentStatus = prev[currentStep];
        const targetStatus = prev[targetStep];
        const targetStepIndex = STEPS_ORDER.indexOf(targetStep);

        if (isMovingForward) {
          newStatuses[currentStep] = 'Finished';
        } else {
          newStatuses[currentStep] =
            currentStatus === 'Finished' ? 'Finished' : 'Inactive';
        }

        newStatuses[targetStep] =
          targetStatus === 'Finished' ? 'Finished' : 'Active';

        if (isMovingForward) {
          STEPS_ORDER.forEach((stepKey, index) => {
            if (index > targetStepIndex) {
              newStatuses[stepKey] =
                prev[stepKey] === 'Finished' ? 'Finished' : 'Inactive';
            }
          });
        }

        return newStatuses;
      });
    },
    [],
  );

  const handleNext = useCallback(async () => {
    devLog('Form Data (handleNext)', getValues());
    devLog(
      'Transformed Data (handleNext)',
      transformProjectData(getValues(), references, fieldApplicability),
    );

    const isStepValid = await validateCurrentStep();
    if (!isStepValid) return;

    const currentIndex = STEPS_ORDER.indexOf(currentStep);

    if (currentIndex < STEPS_ORDER.length - 1) {
      const nextStep = STEPS_ORDER[currentIndex + 1];

      const nextStepFields = getCreateProjectStepFields(nextStep);
      nextStepFields.forEach((field) => {
        clearErrors(field as keyof IProjectFormData);
      });

      updateStepStatuses(currentStep, nextStep, true);
      setCurrentStep(nextStep);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      return;
    }

    const allFormFields = Object.keys(
      getValues(),
    ) as (keyof IProjectFormData)[];
    const fieldsToValidateFinally = getApplicableFields(allFormFields);
    const isFinalValidationValid = await trigger(fieldsToValidateFinally);

    if (isFinalValidationValid) {
      // not call handleSubmit, just call onSubmit directly, to skip the validation of keys in FieldApplicabilityMap
      onSubmit(getValues());
    } else {
      scrollToError(errors);
      addToast({
        title: 'Validation Error',
        description:
          'Please review all steps and ensure required fields are filled',
        color: 'warning',
      });
    }
  }, [
    currentStep,
    validateCurrentStep,
    updateStepStatuses,
    onSubmit,
    trigger,
    getValues,
    fieldApplicability,
    errors,
    scrollToError,
    clearErrors,
    references,
    getApplicableFields,
  ]);

  const handleBack = useCallback(async () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = STEPS_ORDER[currentIndex - 1];

      if (stepStatuses[currentStep] === 'Finished') {
        const isStepValid = await validateCurrentStep();
        if (!isStepValid) return;
      }

      updateStepStatuses(currentStep, prevStep, false);
      setCurrentStep(prevStep);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  }, [currentStep, stepStatuses, validateCurrentStep, updateStepStatuses]);

  const handleGoToStep = useCallback(
    async (targetStep: IItemCategoryEnumWithoutGovernance) => {
      if (targetStep === currentStep) {
        return;
      }

      const currentStepIndex = STEPS_ORDER.indexOf(currentStep);
      const targetStepIndex = STEPS_ORDER.indexOf(targetStep);
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
    [currentStep, validateCurrentStep, updateStepStatuses],
  );

  const handleDiscard = useCallback(() => {
    setIsDiscardModalOpen(true);
  }, []);

  const confirmDiscard = useCallback(() => {
    reset();
    setReferences([]);
    setCurrentStep(IItemCategoryEnum.Basics);
    setStepStatuses(DEFAULT_STEP_STATUSES);
    setIsDiscardModalOpen(false);

    if (formType === IFormTypeEnum.Project) {
      router.push(redirectPath || '/projects');
    } else if (formType === IFormTypeEnum.Proposal && projectId) {
      router.push(redirectPath || `/project/pending/${projectId}`);
    } else {
      router.push(redirectPath || '/projects/pending');
    }
  }, [reset, router, formType, projectId, redirectPath]);

  const hasFieldReference = useCallback(
    (fieldKey: string): boolean => {
      return references.some((ref) => ref.key === fieldKey);
    },
    [references],
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
    formType,
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={cn(
          'flex min-h-screen gap-[40px] px-[160px] pb-[40px]',
          'tablet:gap-[20px] tablet:px-[20px]',
          'mobile:flex-col mobile:gap-[20px] mobile:px-0 mobile:pt-0',
        )}
      >
        <StepNavigation
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          goToStep={handleGoToStep}
          dimmed={showSubmittingPage}
        />

        <div
          className={cn('mobile:gap-[20px] flex flex-1 flex-col gap-[40px]')}
        >
          {!showSubmittingPage ? (
            <div className="mobile:mx-[10px] mobile:p-[10px] flex items-center gap-[10px] rounded-[10px] border border-black/10 bg-[rgba(235,235,235,0.80)] p-[20px] backdrop-blur-[5px]">
              <WarningDiamondIcon className="shrink-0" />
              <p className="text-[16px] leading-[1.6]">
                <span className="font-[700]">Note: {` `}</span>
                Once you submit your proposal, you cannot edit your inputs.
              </p>
            </div>
          ) : null}

          <div className={cn(showSubmittingPage ? 'hidden' : '')}>
            <StepHeader currentStep={currentStep} />
          </div>

          <div className={cn('mobile:px-[14px] flex flex-col gap-[20px]')}>
            <div className={cn(showSubmittingPage ? 'hidden' : '')}>
              <StepWrapper
                stepId={IItemCategoryEnum.Basics}
                currentStep={currentStep}
              >
                <BasicsStepForm {...stepProps} />
              </StepWrapper>
              <StepWrapper
                stepId={IItemCategoryEnum.Technicals}
                currentStep={currentStep}
              >
                <TechnicalsStepForm {...stepProps} />
              </StepWrapper>
              <StepWrapper
                stepId={IItemCategoryEnum.Organization}
                currentStep={currentStep}
              >
                <OrganizationStepForm {...stepProps} />
              </StepWrapper>
              <StepWrapper
                stepId={IItemCategoryEnum.Financial}
                currentStep={currentStep}
              >
                <FinancialStepForm {...stepProps} />
              </StepWrapper>

              <FormActions
                currentStep={currentStep}
                isSubmitting={
                  (formType === IFormTypeEnum.Project
                    ? createProjectMutation.isPending
                    : createProposalMutation.isPending) || isSubmitting
                }
                onBack={handleBack}
                onNext={handleNext}
                onDiscard={handleDiscard}
                formType={formType}
              />
            </div>

            <div className={cn(!showSubmittingPage ? 'hidden' : '')}>
              <SubmittingStep
                formType={formType}
                entityId={createdEntityId}
                projectId={
                  formType === IFormTypeEnum.Proposal
                    ? projectId
                    : projectData?.id
                }
                apiStatus={apiSubmissionStatus}
              />
            </div>
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
