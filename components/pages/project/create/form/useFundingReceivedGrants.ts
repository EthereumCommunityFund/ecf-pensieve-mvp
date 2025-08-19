import { useCallback, useEffect } from 'react';
import { Control, useFieldArray } from 'react-hook-form';

interface UseFundingReceivedGrantsProps {
  control: Control<any>;
  formDisplayType?: string;
  fieldName: string;
}

interface UseFundingReceivedGrantsReturn {
  fields: any[];
  handleAddField: () => void;
  handleRemoveField: (index: number) => void;
}

/**
 * Custom hook for managing funding received grants field array
 * Handles the complex state management for dynamic form fields
 */
export const useFundingReceivedGrants = ({
  control,
  formDisplayType,
  fieldName,
}: UseFundingReceivedGrantsProps): UseFundingReceivedGrantsReturn => {
  const isFundingReceivedGrants = formDisplayType === 'fundingReceivedGrants';

  // Use useFieldArray for proper array field management
  const {
    fields: fundingFields,
    append: appendFunding,
    remove: removeFunding,
  } = useFieldArray({
    control,
    name: isFundingReceivedGrants ? fieldName : 'dummy_funding_field',
    keyName: 'fieldId',
  });

  // Ensure at least one field exists for funding grants
  useEffect(() => {
    if (isFundingReceivedGrants && fundingFields.length === 0) {
      appendFunding({
        date: null,
        organization: '',
        amount: '',
        reference: '',
        expenseSheetUrl: '',
      });
    }
  }, [isFundingReceivedGrants, fundingFields.length, appendFunding]);

  // Memoize event handler for adding new funding field
  const handleAddFundingField = useCallback(() => {
    appendFunding({
      date: null,
      organization: '',
      amount: '',
      reference: '',
      expenseSheetUrl: '',
    });
  }, [appendFunding]);

  // Memoize event handler for removing funding field
  const handleRemoveFundingField = useCallback(
    (index: number) => {
      if (fundingFields.length > 1) {
        removeFunding(index);
      }
    },
    [removeFunding, fundingFields.length],
  );

  // Return the fields and handlers for the component to use
  return {
    fields: isFundingReceivedGrants ? fundingFields : [],
    handleAddField: handleAddFundingField,
    handleRemoveField: handleRemoveFundingField,
  };
};
