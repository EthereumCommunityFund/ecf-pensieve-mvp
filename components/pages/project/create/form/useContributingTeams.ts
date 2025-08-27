import { useCallback, useEffect } from 'react';
import { Control, useFieldArray } from 'react-hook-form';

import { IFormDisplayType } from '@/types/item';
import { getDefaultEmbedTableFormItemValue } from '@/utils/item';

interface UseContributingTeamsProps {
  control: Control<any>;
  formDisplayType: IFormDisplayType;
  fieldName: string;
}

interface UseContributingTeamsReturn {
  fields: any[];
  handleAddField: () => void;
  handleRemoveField: (index: number) => void;
}

/**
 * Custom hook for managing contributing teams field array
 * Handles the complex state management for dynamic form fields
 */
export const useContributingTeams = ({
  control,
  formDisplayType,
  fieldName,
}: UseContributingTeamsProps): UseContributingTeamsReturn => {
  const isContributingTeams = formDisplayType === 'contributing_teams';

  // Use useFieldArray for proper array field management
  const {
    fields: contributingFields,
    append: appendContributing,
    remove: removeContributing,
  } = useFieldArray({
    control,
    name: isContributingTeams ? fieldName : 'dummy_contributing_field',
    keyName: 'fieldId',
  });

  // Ensure at least one field exists for contributing teams
  useEffect(() => {
    if (isContributingTeams && contributingFields.length === 0) {
      appendContributing(getDefaultEmbedTableFormItemValue(formDisplayType));
    }
  }, [
    isContributingTeams,
    contributingFields.length,
    appendContributing,
    formDisplayType,
  ]);

  // Memoize event handler for adding new contributing team field
  const handleAddContributingField = useCallback(() => {
    appendContributing(getDefaultEmbedTableFormItemValue(formDisplayType));
  }, [appendContributing, formDisplayType]);

  // Memoize event handler for removing contributing team field
  const handleRemoveContributingField = useCallback(
    (index: number) => {
      if (contributingFields.length > 1) {
        removeContributing(index);
      }
    },
    [removeContributing, contributingFields.length],
  );

  // Return the fields and handlers for the component to use
  return {
    fields: isContributingTeams ? contributingFields : [],
    handleAddField: handleAddContributingField,
    handleRemoveField: handleRemoveContributingField,
  };
};
