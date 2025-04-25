import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';

/**
 * A hook to determine if a specific form field has a value.
 * It watches the field and returns true if the value is not null, undefined, or an empty string.
 * Assumes the hook is used within a FormProvider context.
 *
 * @param name The name of the field to watch.
 * @returns True if the field has a value, false otherwise.
 */
export function useFieldHasValue<
  TFieldValues extends FieldValues = FieldValues,
>(name: FieldPath<TFieldValues>): boolean {
  const { watch } = useFormContext<TFieldValues>();

  const value = watch(name);

  return value !== null && value !== undefined && value !== '';
}
