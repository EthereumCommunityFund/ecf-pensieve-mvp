import { IItemConfig } from '@/types/item';

import { IProjectFormData } from '../types';
import {
  createContainerProps,
  ICreateContainerPropsParams,
} from '../utils/containerProps';
import { useFieldHasValue } from '../utils/useFieldHasValue';

import { IFormItemUIContainerProps } from './FormItemUIContainer';

// New interface for useCreateContainerPropsWithValue params
interface IUseFromPropsWithValueParams {
  fieldConfig: IItemConfig<keyof IProjectFormData>;
  fieldApplicabilityMap: Record<string, boolean>;
  rawOnChangeApplicability?: (fieldKey: string, value: boolean) => void;
  onAddReference?: (key: string, label: string) => void;
  hasFieldReference?: (fieldKey: string) => boolean;
}

export function useFormPropsWithValue(
  params: IUseFromPropsWithValueParams, // Use the new interface
): Omit<IFormItemUIContainerProps, 'children'> {
  const {
    fieldConfig,
    fieldApplicabilityMap,
    rawOnChangeApplicability,
    onAddReference,
    hasFieldReference,
  } = params;

  const fieldKey = fieldConfig.key as keyof IProjectFormData;
  const hasValue = useFieldHasValue<IProjectFormData>(fieldKey);

  const specificIsApplicable = fieldConfig.showApplicable
    ? fieldApplicabilityMap[fieldKey]
    : undefined;

  const specificOnChangeApplicability =
    fieldConfig.showApplicable && rawOnChangeApplicability
      ? (val: boolean) => rawOnChangeApplicability(fieldKey as string, val)
      : undefined;

  const containerPropsParams: ICreateContainerPropsParams = {
    fieldConfig,
    isApplicable: specificIsApplicable,
    onChangeApplicability: specificOnChangeApplicability,
    onAddReference,
    hasFieldReference,
    showApplicable: !!fieldConfig.showApplicable,
  };

  const containerProps = createContainerProps(containerPropsParams);

  return {
    ...containerProps,
    hasValue,
  };
}
