import { useCallback, useEffect } from 'react';
import { Control, useFieldArray } from 'react-hook-form';

import { IFormDisplayType } from '@/types/item';
import { getDefaultEmbedTableFormItemValue } from '@/utils/item';

interface UseStackIntegrationsProps {
  control: Control<any>;
  formDisplayType: IFormDisplayType;
  fieldName: string;
}

interface UseStackIntegrationsReturn {
  fields: any[];
  handleAddField: () => void;
  handleRemoveField: (index: number) => void;
}

/**
 * Custom hook for managing stack integrations field array
 * Handles the complex state management for dynamic form fields
 */
export const useStackIntegrations = ({
  control,
  formDisplayType,
  fieldName,
}: UseStackIntegrationsProps): UseStackIntegrationsReturn => {
  const isStackIntegrations = formDisplayType === 'stack_integrations';

  // Use useFieldArray for proper array field management
  const {
    fields: stackFields,
    append: appendStack,
    remove: removeStack,
  } = useFieldArray({
    control,
    name: isStackIntegrations ? fieldName : 'dummy_stack_field',
    keyName: 'fieldId',
  });

  // Ensure at least one field exists for stack integrations
  useEffect(() => {
    if (isStackIntegrations && stackFields.length === 0) {
      appendStack(getDefaultEmbedTableFormItemValue(formDisplayType));
    }
  }, [isStackIntegrations, stackFields.length, appendStack, formDisplayType]);

  // Memoize event handler for adding new stack integration field
  const handleAddStackField = useCallback(() => {
    appendStack(getDefaultEmbedTableFormItemValue(formDisplayType));
  }, [appendStack, formDisplayType]);

  // Memoize event handler for removing stack integration field
  const handleRemoveStackField = useCallback(
    (index: number) => {
      if (stackFields.length > 1) {
        removeStack(index);
      }
    },
    [removeStack, stackFields.length],
  );

  // Return the fields and handlers for the component to use
  return {
    fields: isStackIntegrations ? stackFields : [],
    handleAddField: handleAddStackField,
    handleRemoveField: handleRemoveStackField,
  };
};
