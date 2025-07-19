'use client';

import Link from 'next/link';

interface SearchResultItemProps {
  project: {
    id: string;
    name: string;
    tagline?: string;
    mainDescription?: string;
    logoUrl?: string;
    creator: {
      address: string;
      avatar?: string;
      username?: string;
    };
    projectSnap?: {
      name: string;
      tagline?: string;
      mainDescription?: string;
      logoUrl?: string;
    } | null;
    createdAt: string;
  };
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

  const displayName = isPublished
    ? project.projectSnap?.name || project.name
    : project.name;
  const displayDescription = isPublished
    ? project.projectSnap?.mainDescription || project.mainDescription
    : project.mainDescription;
  const displayLogo = isPublished
    ? project.projectSnap?.logoUrl || project.logoUrl
    : project.logoUrl;
  const creatorName =
    project.creator.username || project.creator.address.slice(0, 6) + '...';

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
