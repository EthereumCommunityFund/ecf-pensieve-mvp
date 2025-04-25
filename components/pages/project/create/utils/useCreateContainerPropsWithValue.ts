import { FormFieldContainerProps } from '../FormFieldContainer';
import { ProjectFormData } from '../types';

import {
  createContainerProps,
  ICreateContainerPropsParams,
} from './containerProps';
import { useFieldHasValue } from './useFieldHasValue';

export function useCreateContainerPropsWithValue(
  params: Omit<ICreateContainerPropsParams, 'hasFieldValue'>,
): Omit<FormFieldContainerProps, 'children'> {
  const fieldKey = params.fieldConfig.key as keyof ProjectFormData;

  const hasValue = useFieldHasValue<ProjectFormData>(fieldKey);

  const containerProps = createContainerProps(params);

  return {
    ...containerProps,
    hasValue,
  };
}
