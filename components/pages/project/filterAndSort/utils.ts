import { type FilterState } from './types';

export const parseFilterStateFromURL = (
  searchParams: URLSearchParams,
): FilterState => {
  return {
    categories: searchParams.get('cats')?.split(',').filter(Boolean) || [],
    locations: searchParams.get('locations')?.split(',').filter(Boolean) || [],
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
  };
};

export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.categories.length > 0 ||
    filters.locations.length > 0 ||
    filters.tags.length > 0
  );
};

export const updateFilterParams = (
  searchParams: URLSearchParams,
  type: keyof FilterState,
  value: string,
  checked: boolean,
  currentFilters: FilterState,
): URLSearchParams => {
  const params = new URLSearchParams(searchParams.toString());
  let values = [...currentFilters[type]];

  if (checked) {
    if (!values.includes(value)) {
      values.push(value);
    }
  } else {
    values = values.filter((v) => v !== value);
  }

  if (values.length > 0) {
    const paramName = type === 'categories' ? 'cats' : type;
    params.set(paramName, values.join(','));
  } else {
    const paramName = type === 'categories' ? 'cats' : type;
    params.delete(paramName);
  }

  // Remove type parameter when filtering
  params.delete('type');

  return params;
};

export const clearFilterParams = (
  searchParams: URLSearchParams,
  type?: keyof FilterState,
): URLSearchParams => {
  const params = new URLSearchParams(searchParams.toString());

  if (type) {
    const paramName = type === 'categories' ? 'cats' : type;
    params.delete(paramName);
  } else {
    params.delete('cats');
    params.delete('locations');
    params.delete('tags');
    params.delete('type');
  }

  return params;
};
