import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

export const getItemConfig = (key: IPocItemKey) => {
  return AllItemConfig[key];
};

export const transformFormValue = (
  key: IPocItemKey,
  value: any,
  fieldApplicability: Partial<Record<IPocItemKey, boolean>>,
) => {
  const itemConfig = getItemConfig(key);
  const isFieldApplicable = !!itemConfig?.showApplicable;
  const isKeySetToNA = isFieldApplicable && !fieldApplicability[key];
  return isKeySetToNA ? '' : value;
};
