'use client';

import { addToast } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { trpc } from '@/lib/trpc/client';

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
  ApplicableField,
  CreateProjectStep,
  ProjectCreatePayload,
  ProjectFormData,
  ReferenceData,
  stepFields,
  StepStatus,
} from './types';
import { FieldApplicabilityContext, projectSchema } from './validation';

dayjs.extend(utc);

const transformProjectData = (
  formData: ProjectFormData,
  userId: string,
  references: ReferenceData[],
  fieldApplicability: Record<ApplicableField, boolean>,
): ProjectCreatePayload => {
  return {
    name: formData.projectName,
    tagline: formData.tagline,
    categories: formData.categories,
    mainDescription: formData.mainDescription,
    logoUrl: formData.projectLogo || '',
    websiteUrl: formData.websiteUrl,
    appUrl: fieldApplicability['appUrl']
      ? undefined
      : formData.appUrl || undefined,
    dateFounded: formData.dateFounded
      ? new Date(formData.dateFounded)
      : new Date(),
    dateLaunch: fieldApplicability['dateLaunch']
      ? undefined
      : formData.dateLaunch
        ? new Date(formData.dateLaunch)
        : undefined,
    devStatus: formData.devStatus || 'In Development',
    fundingStatus: fieldApplicability['fundingStatus']
      ? undefined
      : formData.fundingStatus || undefined,
    openSource: formData.openSource === 'Yes',
    codeRepo: fieldApplicability['codeRepo']
      ? undefined
      : formData.codeRepo || undefined,
    tokenContract: fieldApplicability['tokenContract']
      ? undefined
      : formData.tokenContract || undefined,
    orgStructure: formData.orgStructure || 'Centralized',
    publicGoods: formData.publicGoods === 'Yes',
    founders: formData.founders.map((founder) => ({
      name: founder.fullName,
      title: founder.titleRole,
    })),
    refs:
      references.length > 0
        ? references.map((ref) => ({ key: ref.key, value: ref.value }))
        : undefined,
  };
};

const defaultProjectLogo =
  'https://pub-d00cee3ff1154a18bdf38c29db9a51c5.r2.dev/uploads/2d55d07c-1616-4cd4-b929-795751a6bc30.jpeg';

const useCurrentUser = () => {
  return { user: { id: 'user-uuid-placeholder' } };
};

const CreateProjectForm: React.FC = () => {
  const router = useRouter();
  const { user } = useCurrentUser(); // 获取当前用户
  const createProjectMutation = trpc.project.createProject.useMutation();

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
    existingReference: null as ReferenceData | null,
  });

  const [fieldApplicability, setFieldApplicability] = useState<
    Record<ApplicableField, boolean>
  >({
    appUrl: true,
    dateLaunch: true,
    fundingStatus: true,
    codeRepo: true,
    tokenContract: true,
  });

  const methods = useForm<ProjectFormData>({
    resolver: yupResolver<
      ProjectFormData,
      FieldApplicabilityContext,
      ProjectFormData
    >(projectSchema, {
      context: fieldApplicability,
    }),
    mode: 'onTouched',
    defaultValues: {
      projectName: 'leo18 project',
      tagline: '',
      categories: [],
      mainDescription: 'mainDescription',
      projectLogo: defaultProjectLogo,
      websiteUrl: 'https://www.google.com',
      appUrl: null,
      dateFounded: null,
      dateLaunch: null,
      devStatus: '',
      fundingStatus: null,
      openSource: '',
      codeRepo: null,
      tokenContract: null,
      orgStructure: '',
      publicGoods: '',
      founders: [{ fullName: '', titleRole: '' }],
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

  useEffect(() => {
    const fieldsToValidate: (keyof ProjectFormData)[] = [];
    if (Object.prototype.hasOwnProperty.call(fieldApplicability, 'appUrl')) {
      fieldsToValidate.push('appUrl');
    }
    if (
      Object.prototype.hasOwnProperty.call(fieldApplicability, 'dateLaunch')
    ) {
      fieldsToValidate.push('dateLaunch');
    }
    if (
      Object.prototype.hasOwnProperty.call(fieldApplicability, 'fundingStatus')
    ) {
      fieldsToValidate.push('fundingStatus');
    }
    if (Object.prototype.hasOwnProperty.call(fieldApplicability, 'codeRepo')) {
      fieldsToValidate.push('codeRepo');
    }
    if (
      Object.prototype.hasOwnProperty.call(fieldApplicability, 'tokenContract')
    ) {
      fieldsToValidate.push('tokenContract');
    }

    if (fieldsToValidate.length > 0) {
      trigger(fieldsToValidate);
    }
  }, [fieldApplicability, trigger]);

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
    console.log('isValid:', isValid);
    if (isValid) {
      const currentIndex = stepsOrder.indexOf(currentStep);
      console.log('currentIndex:', currentIndex);
      if (currentIndex < stepsOrder.length - 1) {
        const nextStep = stepsOrder[currentIndex + 1];
        console.log('nextStep:', nextStep);
        setStepStatuses((prev) => ({
          ...prev,
          [currentStep]: 'Finished',
          [nextStep]: 'Active',
        }));
        setCurrentStep(nextStep);
      } else {
        console.log('Last step, trigger final submit');
        console.log('表单当前错误:', errors);
        console.log('表单当前值:', getValues());

        const allValid = await trigger();
        console.log('全表单验证结果:', allValid, errors);
        console.log('fieldApplicability:', fieldApplicability);

        handleSubmit((data: ProjectFormData) => {
          console.log('onSubmit被调用,数据:', data);
          onSubmit(data);
        })();
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
        [currentStep]:
          prev[currentStep] === 'Active' ? 'Finished' : prev[currentStep],
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
    console.log('onSubmit 函数被执行:', formData);
    if (!user?.id) {
      addToast({
        title: 'Error',
        description: '用户未认证',
        color: 'danger',
      });
      return;
    }

    const payload = transformProjectData(
      formData,
      user.id,
      references,
      fieldApplicability,
    );

    console.log('transformProjectData Payload:', payload);

    createProjectMutation.mutate(payload, {
      onSuccess: (data) => {
        addToast({
          title: '成功',
          description: '项目创建成功！',
          color: 'success',
        });
        router.push('/projects');
      },
      onError: (error: any) => {
        console.error('提交错误:', error);
        if (error?.data?.zodError?.fieldErrors) {
          const fieldErrors = error.data.zodError.fieldErrors;
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof ProjectFormData, {
              type: 'server',
              message: Array.isArray(messages) ? messages[0] : String(messages),
            });
          });
          addToast({
            title: '验证错误',
            description: '请检查高亮显示的字段',
            color: 'warning',
          });
        } else {
          addToast({
            title: '提交失败',
            description: error?.message || '发生了意外错误，请重试',
            color: 'danger',
          });
        }
      },
    });
  };

  const hasFieldValue = useCallback(
    (fieldName: string): boolean => {
      const value = getValues(fieldName as keyof ProjectFormData);
      return value !== null && value !== undefined && value !== '';
    },
    [getValues],
  );

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

  const handleSaveReference = useCallback(
    (reference: ReferenceData) => {
      setReferences((prev) => {
        const exists = prev.findIndex((ref) => ref.key === reference.key);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = reference;
          return updated;
        }
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

  const handleRemoveReference = useCallback(
    (fieldKey: string) => {
      const fieldLabel =
        references.find((ref) => ref.key === fieldKey)?.key || fieldKey;

      setReferences((prev) => prev.filter((ref) => ref.key !== fieldKey));

      addToast({
        title: '引用已删除',
        description: `已删除 "${fieldLabel}" 的引用`,
        color: 'warning',
      });
    },
    [references],
  );

  const onChangeApplicability = useCallback(
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
    onChangeApplicability,
    onAddReference: handleAddReference,
    onRemoveReference: handleRemoveReference,
    hasFieldValue,
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
        onRemoveReference={handleRemoveReference}
        fieldKey={currentReferenceField.key}
        fieldLabel={currentReferenceField.label}
        existingReference={currentReferenceField.existingReference}
      />
    </FormProvider>
  );
};

export default CreateProjectForm;
