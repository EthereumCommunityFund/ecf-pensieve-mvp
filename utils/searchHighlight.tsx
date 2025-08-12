import React from 'react';

/**
 * Options for text highlighting
 */
export interface HighlightOptions {
  caseSensitive?: boolean;
  highlightClassName?: string;
  markTagProps?: React.HTMLProps<HTMLElement>;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights matching text within a string
 * @param text - The text to search within
 * @param query - The search query to highlight
 * @param options - Options for highlighting behavior
 * @returns Array of React nodes with highlighted text
 */
export function highlightSearchText(
  text: string,
  query: string,
  options: HighlightOptions = {},
): React.ReactNode[] {
  const {
    caseSensitive = false,
    highlightClassName = 'bg-yellow-200 text-yellow-800 px-0.5 rounded-sm',
    markTagProps = {},
  } = options;

  // If no query or text, return original text
  if (!query || !query.trim() || !text) {
    return [text];
  }

  // Create regex pattern for matching
  const flags = caseSensitive ? 'g' : 'gi';
  const escapedQuery = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escapedQuery})`, flags);

  // Split text by matches
  const parts = text.split(regex);

  // Map parts to React nodes
  return parts.map((part, index) => {
    // Check if this part matches the query
    const isMatch = caseSensitive
      ? part === query
      : part.toLowerCase() === query.toLowerCase();

    if (isMatch && part) {
      return (
        <mark key={index} className={highlightClassName} {...markTagProps}>
          {part}
        </mark>
      );
    }

    return part;
  });
}

/**
 * Highlights matching tags within an array of tags
 * @param tags - Array of tags to search within
 * @param query - The search query to highlight
 * @param options - Options for highlighting behavior
 * @returns Array of objects with tag and highlighted React nodes
 */
export function highlightTagsText(
  tags: string[],
  query: string,
  options: HighlightOptions = {},
): { tag: string; highlighted: React.ReactNode; isMatch: boolean }[] {
  if (!tags || tags.length === 0) {
    return [];
  }

  const { caseSensitive = false } = options;
  const trimmedQuery = query?.trim() || '';

  return tags.map((tag) => {
    // Check if tag matches the query
    const isMatch = trimmedQuery
      ? caseSensitive
        ? tag.includes(trimmedQuery)
        : tag.toLowerCase().includes(trimmedQuery.toLowerCase())
      : false;

    return {
      tag,
      highlighted: highlightSearchText(tag, query, options),
      isMatch,
    };
  });
}

/**
 * Gets only the tags that match the search query
 * @param tags - Array of tags to filter
 * @param query - The search query
 * @param maxDisplay - Maximum number of matching tags to return
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Array of matching tags
 */
export function getMatchingTags(
  tags: string[],
  query: string,
  maxDisplay: number = 3,
  caseSensitive: boolean = false,
): string[] {
  if (!tags || tags.length === 0 || !query || !query.trim()) {
    return [];
  }

  const trimmedQuery = query.trim();

  const matchingTags = tags.filter((tag) =>
    caseSensitive
      ? tag.includes(trimmedQuery)
      : tag.toLowerCase().includes(trimmedQuery.toLowerCase()),
  );

  return matchingTags.slice(0, maxDisplay);
}

/**
 * Custom hook for using highlighting in components
 */
export function useHighlight(options: HighlightOptions = {}) {
  const highlightText = React.useCallback(
    (text: string, query: string) => {
      return highlightSearchText(text, query, options);
    },
    [options],
  );

  const highlightTags = React.useCallback(
    (tags: string[], query: string) => {
      return highlightTagsText(tags, query, options);
    },
    [options],
  );

  return {
    highlightText,
    highlightTags,
  };
}
