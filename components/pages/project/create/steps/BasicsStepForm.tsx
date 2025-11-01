'use client';

import React from 'react';

import { basicsFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';

import { IStepFormProps } from '../types';

interface BasicsStepFormProps
  extends Omit<IStepFormProps, 'register' | 'hasFieldValue'> {
  enableNameSuggestions?: boolean;
}

const BasicsStepForm: React.FC<BasicsStepFormProps> = ({
  control,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
  formType,
  enableNameSuggestions = false,
}) => {
  const fieldConfigArray = Object.values(basicsFieldsConfig);

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {fieldConfigArray.map((itemConfig) => (
        <FormItemManager
          key={itemConfig.key}
          itemConfig={itemConfig}
          control={control}
          fieldApplicability={fieldApplicability}
          onChangeApplicability={onChangeApplicability}
          onAddReference={onAddReference}
          hasFieldReference={hasFieldReference}
          formType={formType}
          showNameSuggestions={enableNameSuggestions}
        />
      ))}
    </div>
  );
};

export default BasicsStepForm;
