export const normalizeUrl = (
  value: string | null | undefined,
): string | null | undefined => {
  if (!value) {
    return '';
  }

  const trimmedValue = value.trim();
  if (trimmedValue === '') {
    return trimmedValue;
  }

  if (
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('https://')
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};
