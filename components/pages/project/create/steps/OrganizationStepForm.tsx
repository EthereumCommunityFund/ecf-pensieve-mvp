'use client';

import React from 'react';

import { organizationFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';

import { IStepFormProps } from '../types';

const OrganizationStepForm: React.FC<
  Omit<
    IStepFormProps,
    'register' | 'watch' | 'setValue' | 'trigger' | 'hasFieldValue'
  >
> = ({
  control,
  errors,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
  formType,
}) => {
  const organizationFieldConfigs = [
    organizationFieldsConfig.orgStructure,
    organizationFieldsConfig.publicGoods,
    organizationFieldsConfig.founders,
  ];

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {organizationFieldConfigs.map((itemConfig) => (
        <FormItemManager
          key={itemConfig.key}
          itemConfig={itemConfig}
          control={control}
          fieldApplicability={fieldApplicability}
          onChangeApplicability={onChangeApplicability}
          onAddReference={onAddReference}
          hasFieldReference={hasFieldReference}
          formType={formType}
        />
      ))}
    </div>
  );
};

export default OrganizationStepForm;
