import { useCallback, useEffect } from 'react';
import { Control, useFieldArray } from 'react-hook-form';

import { IFormDisplayType } from '@/types/item';
import { getDefaultEmbedTableFormItemValue } from '@/utils/item';

interface UseAffiliatedProjectsProps {
  control: Control<any>;
  formDisplayType: IFormDisplayType;
  fieldName: string;
}

interface UseAffiliatedProjectsReturn {
  fields: any[];
  handleAddField: () => void;
  handleRemoveField: (index: number) => void;
}

/**
 * Custom hook for managing affiliated projects field array
 * Handles the complex state management for dynamic form fields
 */
export const useAffiliatedProjects = ({
  control,
  formDisplayType,
  fieldName,
}: UseAffiliatedProjectsProps): UseAffiliatedProjectsReturn => {
  const isAffiliatedProjects = formDisplayType === 'affiliated_projects';

  // Use useFieldArray for proper array field management
  const {
    fields: affiliatedFields,
    append: appendAffiliated,
    remove: removeAffiliated,
  } = useFieldArray({
    control,
    name: isAffiliatedProjects ? fieldName : 'dummy_affiliated_field',
    keyName: 'fieldId',
  });

  // Ensure at least one field exists for affiliated projects
  useEffect(() => {
    if (isAffiliatedProjects && affiliatedFields.length === 0) {
      appendAffiliated(getDefaultEmbedTableFormItemValue(formDisplayType));
    }
  }, [
    isAffiliatedProjects,
    affiliatedFields.length,
    appendAffiliated,
    formDisplayType,
  ]);

  // Memoize event handler for adding new affiliated project field
  const handleAddAffiliatedField = useCallback(() => {
    appendAffiliated(getDefaultEmbedTableFormItemValue(formDisplayType));
  }, [appendAffiliated, formDisplayType]);

  // Memoize event handler for removing affiliated project field
  const handleRemoveAffiliatedField = useCallback(
    (index: number) => {
      if (affiliatedFields.length > 1) {
        removeAffiliated(index);
      }
    },
    [removeAffiliated, affiliatedFields.length],
  );

  // Return the fields and handlers for the component to use
  return {
    fields: isAffiliatedProjects ? affiliatedFields : [],
    handleAddField: handleAddAffiliatedField,
    handleRemoveField: handleRemoveAffiliatedField,
  };
};
