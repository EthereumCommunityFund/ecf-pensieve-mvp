const formatWeight = (weight: number) => {
  if (weight > 9999) {
    return `${(weight / 1000).toFixed(2).padStart(2, '0')}K`;
  }
  return weight;
};

export { formatWeight };
