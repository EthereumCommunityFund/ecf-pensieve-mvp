'use client';

import React from 'react';

import { financialFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';

import { IStepFormProps } from '../types';

const FinancialStepForm: React.FC<
  Omit<IStepFormProps, 'register' | 'hasFieldValue'>
> = ({
  control,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
  formType,
}) => {
  const fieldConfigArray = Object.values(financialFieldsConfig);

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
        />
      ))}
    </div>
  );
};

export default FinancialStepForm;
