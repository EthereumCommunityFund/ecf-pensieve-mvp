'use client';

import Link from 'next/link';

import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface SearchResultItemProps {
  project: IProject;
  query: string;
  isPublished: boolean;
  onClose: () => void;
}

export default function SearchResultItem({
  project,
  query,
  isPublished,
  onClose,
}: SearchResultItemProps) {
  const { logoUrl, projectName, tagline, getItemValue } =
    useProjectItemValue(project);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="rounded bg-yellow-200 px-1 text-yellow-800"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const displayName = projectName;
  const displayDescription = tagline || getItemValue('mainDescription' as any);
  const displayLogo = logoUrl;
  const creatorName =
    project.creator.name || project.creator.address.slice(0, 6) + '...';

  const projectUrl = isPublished
    ? `/project/${project.id}`
    : `/project/pending/${project.id}`;

  return (
    <Link href={projectUrl} onClick={onClose}>
      <div className="cursor-pointer py-3 transition-colors hover:bg-gray-50">
        <div className="flex items-start gap-3">
          {/* Project Icon */}
          <div className="size-10 shrink-0 overflow-hidden rounded-md border border-gray-200">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt={displayName}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-gray-100">
                <span className="text-sm font-semibold text-gray-500">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1">
              <h4 className="truncate text-sm font-semibold text-gray-900">
                {highlightText(displayName, query)}
              </h4>
            </div>
            <div className="line-clamp-2 text-sm text-gray-600 opacity-70">
              {displayDescription || 'No description available'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
