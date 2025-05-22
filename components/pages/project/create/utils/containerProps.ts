import { IItemConfig } from '@/types/item';

import { FormFieldContainerProps } from '../FormFieldContainer';
import { IProjectFormData } from '../types';

export interface ICreateContainerPropsParams {
  fieldConfig: IItemConfig<keyof IProjectFormData>;
  showApplicable?: boolean;
  isApplicable?: boolean;
  onChangeApplicability?: (val: boolean) => void;
  onAddReference?: (key: string, label: string) => void;
  hasFieldReference?: (fieldKey: string) => boolean;
}

export const createContainerProps = ({
  fieldConfig,
  showApplicable,
  isApplicable,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}: ICreateContainerPropsParams): Omit<
  FormFieldContainerProps,
  'children' | 'hasValue'
> => {
  const fieldKey = fieldConfig.key as string;
  const hasReference = hasFieldReference ? hasFieldReference(fieldKey) : false;

  return {
    label: fieldConfig.label,
    description: fieldConfig.description,
    shortDescription: fieldConfig.shortDescription,
    weight: Number(fieldConfig.weight),
    showReference: fieldConfig.showReference,
    showApplicable: !!fieldConfig.showApplicable,
    isApplicable,
    onChangeApplicability,
    onAddReference:
      fieldConfig.showReference && onAddReference
        ? () => onAddReference(fieldKey, fieldConfig.label)
        : undefined,
    hasReference,
  };
};
