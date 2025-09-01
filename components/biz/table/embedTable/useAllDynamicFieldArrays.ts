import { useEffect, useMemo } from 'react';
import { Control, useFieldArray } from 'react-hook-form';

import { IFormDisplayType } from '@/types/item';
import { getDefaultEmbedTableFormItemValue } from '@/utils/item';

import {
  DYNAMIC_FIELDS_CONFIG,
  isDynamicFieldType,
} from './dynamicFieldsConfig';

interface DynamicFieldHandlers {
  fields: any[];
  handleAddField: () => void;
  handleRemoveField: (index: number) => void;
}

type DynamicFieldsMap = {
  [K in keyof typeof DYNAMIC_FIELDS_CONFIG]?: DynamicFieldHandlers;
};

interface UseAllDynamicFieldArraysProps {
  control: Control<any>;
  formDisplayType: IFormDisplayType;
  fieldName: string;
}

/**
 * Enhanced hook that manages all dynamic field arrays at once
 * Reduces boilerplate and provides a cleaner API
 */
export const useAllDynamicFieldArrays = ({
  control,
  formDisplayType,
  fieldName,
}: UseAllDynamicFieldArraysProps): DynamicFieldsMap => {
  const isDynamic = isDynamicFieldType(formDisplayType);

  // Only create field array for the current form type if it's a dynamic type
  const {
    fields: activeFields,
    append: activeAppend,
    remove: activeRemove,
  } = useFieldArray({
    control,
    name: isDynamic ? fieldName : 'dummy_field',
    keyName: 'fieldId',
  });

  // Ensure at least one field exists for dynamic types
  useEffect(() => {
    if (isDynamic && activeFields.length === 0) {
      activeAppend(getDefaultEmbedTableFormItemValue(formDisplayType));
    }
  }, [isDynamic, activeFields.length, activeAppend, formDisplayType]);

  // Create handlers for the active form type
  const activeHandlers = useMemo(() => {
    if (!isDynamic) return null;

    return {
      fields: activeFields,
      handleAddField: () => {
        activeAppend(getDefaultEmbedTableFormItemValue(formDisplayType));
      },
      handleRemoveField: (index: number) => {
        if (activeFields.length > 1) {
          activeRemove(index);
        }
      },
    };
  }, [isDynamic, activeFields, activeAppend, activeRemove, formDisplayType]);

  // Build the result map - only includes the active form type
  const result = useMemo(() => {
    const map: DynamicFieldsMap = {};

    if (isDynamic && activeHandlers) {
      map[formDisplayType as keyof typeof DYNAMIC_FIELDS_CONFIG] =
        activeHandlers;
    }

    return map;
  }, [isDynamic, formDisplayType, activeHandlers]);

  return result;
};
