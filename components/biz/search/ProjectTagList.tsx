'use client';

import React from 'react';

import { highlightSearchText } from '@/utils/searchHighlight';

interface ProjectTagListProps {
  tags: string[];
  query?: string;
  maxDisplay?: number;
  className?: string;
  showAll?: boolean;
}

/**
 * Component for displaying project tags with search highlighting
 */
export function ProjectTagList({
  tags,
  query,
  maxDisplay = 3,
  className = '',
  showAll = false,
}: ProjectTagListProps) {
  // Filter and limit tags based on query and display settings
  const displayTags = React.useMemo(() => {
    const safeTags = tags || [];

    if (!query || !query.trim()) {
      // No query, show first few tags
      return showAll ? safeTags : safeTags.slice(0, maxDisplay);
    }

    // Filter tags that match the query
    const matchingTags = safeTags.filter((tag) =>
      tag.toLowerCase().includes(query.toLowerCase()),
    );

    // If we have matching tags, prioritize them
    if (matchingTags.length > 0) {
      const limitedMatchingTags = showAll
        ? matchingTags
        : matchingTags.slice(0, maxDisplay);

      // If we have space for more tags and not showing all matching tags
      if (!showAll && limitedMatchingTags.length < maxDisplay) {
        const remainingSlots = maxDisplay - limitedMatchingTags.length;
        const nonMatchingTags = safeTags.filter(
          (tag) => !matchingTags.includes(tag),
        );
        return [
          ...limitedMatchingTags,
          ...nonMatchingTags.slice(0, remainingSlots),
        ];
      }

      return limitedMatchingTags;
    }

    // No matching tags, show first few tags
    return showAll ? safeTags : safeTags.slice(0, maxDisplay);
  }, [tags, query, maxDisplay, showAll]);

  const remainingCount = (tags?.length || 0) - displayTags.length;

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag, index) => (
        <TagItem key={`${tag}-${index}`} tag={tag} query={query} />
      ))}
      {remainingCount > 0 && !showAll && (
        <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

interface TagItemProps {
  tag: string;
  query?: string;
}

/**
 * Individual tag item with highlighting
 */
function TagItem({ tag, query }: TagItemProps) {
  const isMatch = query && tag.toLowerCase().includes(query.toLowerCase());

  const content = React.useMemo(() => {
    if (!query || !isMatch) {
      return tag;
    }
    return highlightSearchText(tag, query);
  }, [tag, query, isMatch]);

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2 py-1 text-xs
        ${
          isMatch
            ? 'border border-yellow-200 bg-yellow-100 font-medium text-yellow-800'
            : 'border border-gray-200 bg-gray-100 text-gray-700'
        }
      `}
    >
      {content}
    </span>
  );
}

/**
 * Highlighted tag component for standalone use
 */
export function HighlightedTag({
  tag,
  query,
  className = '',
}: {
  tag: string;
  query?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <TagItem tag={tag} query={query} />
    </div>
  );
}
