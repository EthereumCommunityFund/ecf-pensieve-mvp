import { FormFieldContainerProps } from '../FormFieldContainer';
import { FormFieldConfig } from '../formData';
import { ProjectFormData } from '../types';

export interface ICreateContainerPropsParams {
  fieldConfig: FormFieldConfig<keyof ProjectFormData>;
  showApplicable?: boolean;
  isApplicable?: boolean;
  onChangeApplicability?: (val: boolean) => void;
  onAddReference?: (key: string, label: string) => void;
}

export const createContainerProps = ({
  fieldConfig,
  showApplicable,
  isApplicable,
  onChangeApplicability,
  onAddReference,
}: ICreateContainerPropsParams): Omit<FormFieldContainerProps, 'children'> => {
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
        ? () => onAddReference(fieldConfig.key as string, fieldConfig.label)
        : undefined,
  };
};
