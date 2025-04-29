import { useCallback, useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';

type ScrollBehavior = 'auto' | 'smooth';
type ScrollLogicalPosition = 'start' | 'center' | 'end' | 'nearest';

interface FormScrollToErrorOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  delay?: number;
  offset?: number;
}

const defaultOptions: Required<FormScrollToErrorOptions> = {
  behavior: 'smooth',
  block: 'center',
  delay: 0,
  offset: 0,
};

export function useFormScrollToError(options: FormScrollToErrorOptions = {}) {
  const mergedOptions = useMemo(
    () => ({ ...defaultOptions, ...options }),
    [options],
  );

  const findFirstError = useCallback(
    (errors: Record<string, any>, path = ''): string | null => {
      const errorKeys = Object.keys(errors);

      for (const key of errorKeys) {
        const currentPath = path ? `${path}.${key}` : key;

        if (errors[key]?.type) {
          return currentPath;
        } else if (
          errors[key] &&
          typeof errors[key] === 'object' &&
          !Array.isArray(errors[key])
        ) {
          const nestedResult = findFirstError(errors[key], currentPath);
          if (nestedResult) return nestedResult;
        }
      }

      return null;
    },
    [],
  );

  const pathToFieldName = useCallback((path: string): string => {
    return path.replace(/\.(\d+)\./g, '[$1].').replace(/\.([^.]+)$/g, '[$1]');
  }, []);

  const scrollToError = useCallback(
    (errors: FieldErrors<any>) => {
      if (!errors || Object.keys(errors).length === 0) return;

      const { behavior, block, delay, offset } = mergedOptions;

      const firstErrorPath = findFirstError(errors);

      if (!firstErrorPath) return;

      const fieldName = pathToFieldName(firstErrorPath);

      setTimeout(() => {
        let errorElement = document.querySelector(`[name="${fieldName}"]`);

        if (!errorElement) {
          errorElement = document.getElementById(
            `field-${firstErrorPath.replace(/\./g, '-')}`,
          );
        }

        if (!errorElement) {
          const simpleFieldName = firstErrorPath.split('.').pop();
          errorElement = document.getElementById(`field-${simpleFieldName}`);
        }

        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: behavior,
            block: block,
          });

          if (offset) {
            const currentScrollPosition =
              window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo({
              top: currentScrollPosition - offset,
              behavior: behavior,
            });
          }
        }
      }, delay);
    },
    [findFirstError, pathToFieldName, mergedOptions],
  );

  return { scrollToError };
}
