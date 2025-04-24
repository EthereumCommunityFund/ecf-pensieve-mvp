import { FormFieldContainerProps } from '../FormFieldContainer';
import { FormFieldConfig } from '../formData';
import { ProjectFormData } from '../types';

export interface ICreateContainerPropsParams {
  fieldConfig: FormFieldConfig<keyof ProjectFormData>;
  showApplicable?: boolean;
  isApplicable?: boolean;
  onChangeApplicability?: (val: boolean) => void;
  onAddReference?: (key: string, label: string) => void;
  hasFieldValue?: (fieldName: string) => boolean;
  hasFieldReference?: (fieldKey: string) => boolean;
}

export const createContainerProps = ({
  fieldConfig,
  showApplicable,
  isApplicable,
  onChangeApplicability,
  onAddReference,
  hasFieldValue,
  hasFieldReference,
}: ICreateContainerPropsParams): Omit<FormFieldContainerProps, 'children'> => {
  const fieldKey = fieldConfig.key as string;
  const hasValue = hasFieldValue ? hasFieldValue(fieldKey) : false;
  const hasReference = hasFieldReference ? hasFieldReference(fieldKey) : false;

  return {
    label: fieldConfig.label,
    description: fieldConfig.description,
    shortDescription: fieldConfig.shortDescription,
    weight: fieldConfig.weight,
    showReference: fieldConfig.showReference,
    showApplicable,
    isApplicable,
    onChangeApplicability,
    onAddReference:
      fieldConfig.showReference && onAddReference
        ? () => onAddReference(fieldKey, fieldConfig.label)
        : undefined,
    hasValue,
    hasReference,
  };
};
