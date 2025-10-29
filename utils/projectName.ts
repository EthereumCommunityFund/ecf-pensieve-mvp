export const normalizeProjectName = (name: string): string => {
  if (!name) {
    return '';
  }

  return name
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\p{Z}\p{P}\p{S}\p{C}]+/gu, '');
};

export const isProjectNameMeaningful = (name: string): boolean => {
  return normalizeProjectName(name).length > 0;
};
