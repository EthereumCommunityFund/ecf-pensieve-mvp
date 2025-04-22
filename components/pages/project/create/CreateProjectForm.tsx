'use client';

import { addToast } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

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
  ProjectCreatePayload,
  ProjectFormData,
  ReferenceData,
  stepFields, // Import the step fields mapping
  StepStatus,
} from './types';
import { projectSchema } from './validation';
// Assume trpc client and a way to get user ID are available
// import { trpc } from '@/utils/trpc';
// import { useCurrentUser } from '@/hooks/useCurrentUser';

dayjs.extend(utc);

// --- Mock tRPC and User Hook ---
const useMockMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (
    payload: ProjectCreatePayload,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    },
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
    console.log('Submitting payload:', payload);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    // Simulate success/error
    const shouldSucceed = Math.random() > 0.2;

    if (shouldSucceed) {
      const mockResponse = { id: `proj_${Date.now()}`, ...payload };
      console.log('Mock Success Response:', mockResponse);
      setIsLoading(false);
      setIsSuccess(true);
      options?.onSuccess?.(mockResponse);
    } else {
      const mockError = new Error(
        'Failed to create project (simulated backend error)',
      );
      // Simulate field-specific error (optional)
      // const mockError = { message: "Backend validation failed", fieldErrors: { projectName: "Project name already exists" } };
      console.error('Mock Error:', mockError);
      setIsLoading(false);
      setIsError(true);
      setError(mockError);
      options?.onError?.(mockError);
    }
  };

  return { mutate, isLoading, isSuccess, isError, error };
};

const useCurrentUser = () => {
  return { user: { id: 'user-uuid-placeholder' } }; // Replace with actual user logic
};
// --- End Mock ---

const transformProjectData = (
  formData: ProjectFormData,
  userId: string,
  references: ReferenceData[],
): ProjectCreatePayload => {
  return {
    name: formData.projectName,
    tagline: formData.tagline,
    categories: formData.categories,
    mainDescription: formData.mainDescription,
    logoUrl: formData.projectLogo,
    websiteUrl: formData.websiteUrl,
    appUrl: formData.isAppUrlApplicable ? formData.appUrl : null,
    dateFounded: formData.dateFounded
      ? dayjs(formData.dateFounded).utc().toISOString()
      : '', // Should not be empty if required
    dateLaunch:
      formData.isLaunchDateApplicable && formData.dateLaunch
        ? dayjs(formData.dateLaunch).utc().toISOString()
        : null,
    devStatus: formData.devStatus as ProjectCreatePayload['devStatus'], // Cast, already validated
    fundingStatus: formData.isFundingStatusApplicable
      ? (formData.fundingStatus as ProjectCreatePayload['fundingStatus'])
      : null,
    openSource: formData.openSource === 'Yes',
    codeRepo: formData.isCodeRepoApplicable ? formData.codeRepo : null,
    tokenContract: formData.isTokenContractApplicable
      ? formData.tokenContract
      : null,
    orgStructure: formData.orgStructure as ProjectCreatePayload['orgStructure'], // Cast
    publicGoods: formData.publicGoods === 'Yes',
    founders: formData.founders.map((founder) => JSON.stringify(founder)), // Serialize founders
    creator: userId,
    refs: references.length > 0 ? references : null,
  };
};

const CreateProjectForm: React.FC = () => {
  const router = useRouter();
  // TODO login logic
  const { user } = useCurrentUser(); // Get current user
  const createProjectMutation = useMockMutation(); // Replace with actual tRPC hook: trpc.project.create.useMutation();

  const [currentStep, setCurrentStep] = useState<CreateProjectStep>(
    CreateProjectStep.Basics,
  );
  const [stepStatuses, setStepStatuses] = useState<
    Record<CreateProjectStep, StepStatus>
  >({
    [CreateProjectStep.Basics]: 'Active',
    [CreateProjectStep.Dates]: 'Inactive',
    [CreateProjectStep.Technicals]: 'Inactive',
    [CreateProjectStep.Organization]: 'Inactive',
  });
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);

  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [currentReferenceField, setCurrentReferenceField] = useState({
    key: '',
    label: '',
  });

  const methods = useForm<ProjectFormData>({
    resolver: yupResolver(projectSchema),
    mode: 'onTouched', // Validate on blur/change after first touch
    defaultValues: {
      projectName: '',
      tagline: '',
      categories: [],
      mainDescription: '',
      projectLogo: null, // Default for string URL is null or ''
      websiteUrl: '',
      appUrl: null,
      isAppUrlApplicable: true,
      dateFounded: null,
      dateLaunch: null,
      isLaunchDateApplicable: true,
      devStatus: '',
      fundingStatus: null,
      isFundingStatusApplicable: true,
      openSource: '',
      codeRepo: null,
      isCodeRepoApplicable: true,
      tokenContract: null,
      isTokenContractApplicable: true,
      orgStructure: '',
      publicGoods: '',
      founders: [{ fullName: '', titleRole: '' }], // Start with one founder
    },
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

  useEffect(() => {
    const currentFields = stepFields[currentStep];
    const hasErrorsInCurrentStep = currentFields.some((field) => errors[field]);
    setIsCurrentStepValid(!hasErrorsInCurrentStep);
  }, [errors, currentStep, trigger]);

  const stepsOrder: CreateProjectStep[] = [
    CreateProjectStep.Basics,
    CreateProjectStep.Dates,
    CreateProjectStep.Technicals,
    CreateProjectStep.Organization,
  ];

  const handleNext = async () => {
    const currentFields = stepFields[currentStep];
    const isValid = await trigger(currentFields);

    setIsCurrentStepValid(isValid);
    if (isValid) {
      const currentIndex = stepsOrder.indexOf(currentStep);
      if (currentIndex < stepsOrder.length - 1) {
        const nextStep = stepsOrder[currentIndex + 1];
        setStepStatuses((prev) => ({
          ...prev,
          [currentStep]: 'Finished',
          [nextStep]: 'Active',
        }));
        setCurrentStep(nextStep);
      } else {
        // Last step, trigger final submit
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
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
  };

  const handleGoToStep = (step: CreateProjectStep) => {
    if (stepStatuses[step] === 'Finished') {
      setStepStatuses((prev) => ({
        ...prev,
        // Set all intermediate steps back to finished? or handle individually?
        [currentStep]:
          prev[currentStep] === 'Active' ? 'Finished' : prev[currentStep], // Keep finished if it was
        [step]: 'Active',
      }));
      setCurrentStep(step);
    }
  };

  const handleDiscard = () => {
    setIsDiscardModalOpen(true);
  };

  const confirmDiscard = () => {
    reset();
    setReferences([]);
    setCurrentStep(CreateProjectStep.Basics);
    setStepStatuses({
      [CreateProjectStep.Basics]: 'Active',
      [CreateProjectStep.Dates]: 'Inactive',
      [CreateProjectStep.Technicals]: 'Inactive',
      [CreateProjectStep.Organization]: 'Inactive',
    });
    setIsDiscardModalOpen(false);
    router.push('/projects');
  };

  const onSubmit = async (formData: ProjectFormData) => {
    if (!user?.id) {
      addToast({
        title: 'Error',
        description: 'User not authenticated.',
        color: 'danger',
      });
      return;
    }

    const payload = transformProjectData(formData, user.id, references);

    createProjectMutation.mutate(payload, {
      onSuccess: (data) => {
        addToast({
          title: 'Success',
          description: 'Project created successfully!',
          color: 'success',
        });
        // router.push(`/projects/${data.id}`); // Use actual ID from response
        router.push('/projects');
      },
      onError: (error: any) => {
        console.error('Submission Error:', error);
        if (error?.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof ProjectFormData, {
              type: 'server',
              message: message as string,
            });
          });
          // TODO: Maybe switch to the first step with a server error?
          addToast({
            title: 'Validation Error',
            description: 'Please check the highlighted fields.',
            color: 'warning',
          });
        } else {
          addToast({
            title: 'Submission Failed',
            description:
              error?.message ||
              'An unexpected error occurred. Please try again.',
            color: 'danger',
          });
        }
      },
    });
  };

  const handleAddReference = useCallback((key: string, label?: string) => {
    setCurrentReferenceField({
      key,
      label: label || key,
    });
    setIsReferenceModalOpen(true);
  }, []);

  const handleSaveReference = useCallback(
    (reference: ReferenceData) => {
      setReferences((prev) => {
        // 检查是否已存在相同字段的引用，如果有则更新
        const exists = prev.findIndex((ref) => ref.key === reference.key);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = reference;
          return updated;
        }
        // 否则添加新引用
        return [...prev, reference];
      });

      addToast({
        title: '引用已添加',
        description: `已为 "${currentReferenceField.label}" 添加引用`,
        color: 'success',
      });
    },
    [currentReferenceField.label],
  );

  const stepProps = {
    control,
    errors,
    watch,
    setValue,
    trigger,
    onAddReference: handleAddReference,
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-screen gap-[40px] px-[160px] py-[40px] tablet:gap-[20px] tablet:px-[20px] mobile:flex-col mobile:gap-[20px] mobile:px-0 mobile:pt-0"
      >
        <StepNavigation
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          goToStep={handleGoToStep}
        />
        <div className="flex flex-1 flex-col gap-[40px]">
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
              <OrganizationStepForm
                control={control}
                errors={errors}
                onAddReference={handleAddReference}
              />
            </StepWrapper>

            <FormActions
              currentStep={currentStep}
              isSubmitting={createProjectMutation.isLoading || isSubmitting} // Combine RHF and mutation loading state
              isStepValid={isCurrentStepValid}
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
        fieldKey={currentReferenceField.key}
        fieldLabel={currentReferenceField.label}
      />
    </FormProvider>
  );
};

export default CreateProjectForm;
