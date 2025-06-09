import { Control, Controller } from 'react-hook-form';

import { useFormPropsWithValue } from '@/components/pages/project/create/form/useFormPropsWithValue';
import { IEssentialItemKey, IItemConfig } from '@/types/item';

import { IProjectFormData } from '../types';

import FormItemRenderer from './FormItemRenderer';
import { FormItemUIContainer } from './FormItemUIContainer';

interface IFormItemManagerProps<TFieldKey extends IEssentialItemKey> {
  itemConfig: IItemConfig<TFieldKey>;
  control: Control<IProjectFormData, any>;
  fieldApplicability: Record<string, boolean>;
  onChangeApplicability: (fieldKey: string, value: boolean) => void;
  onAddReference: (key: string, label?: string | undefined) => void;
  hasFieldReference: (fieldKey: string) => boolean;
}

const FormItemManager = <TFieldKey extends keyof IProjectFormData>({
  itemConfig,
  control,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}: IFormItemManagerProps<TFieldKey>) => {
  const containerProps = useFormPropsWithValue({
    fieldConfig: itemConfig,
    fieldApplicabilityMap: fieldApplicability,
    rawOnChangeApplicability: onChangeApplicability,
    onAddReference: onAddReference,
    hasFieldReference,
  });

  return (
    <FormItemUIContainer {...containerProps}>
      <Controller
        name={itemConfig.key}
        control={control}
        render={({ field, fieldState }) => (
          <FormItemRenderer
            field={field}
            fieldState={fieldState}
            itemConfig={itemConfig}
            fieldApplicability={fieldApplicability}
          />
        )}
      />
    </FormItemUIContainer>
  );
};

export default FormItemManager;
