import { Metadata } from 'next';
import type { ReactNode } from 'react';

import { buildProjectJsonLd } from '@/lib/services/projectJsonLd';
import {
  getTopAccountableProjects,
  getTopTransparentProjects,
  type ProjectStructuredData,
} from '@/lib/services/projectService';
import { buildAbsoluteUrl } from '@/lib/utils/url';

import ProjectsLayoutClient from './layout.client';

const PROJECTS_ROUTE = '/projects';

export async function generateMetadata(): Promise<Metadata> {
  const [accountableProjects, transparentProjects] = await Promise.all([
    getTopAccountableProjects(1),
    getTopTransparentProjects(1),
  ]);

  const topAccountable = accountableProjects[0];
  const topTransparent = transparentProjects[0];

  const highlights: string[] = [];

  if (topAccountable?.name) {
    highlights.push(`Top accountable project: ${topAccountable.name}`);
  }

  if (topTransparent?.name && topTransparent.id !== topAccountable?.id) {
    highlights.push(`Top transparent project: ${topTransparent.name}`);
  }

  const baseDescription =
    'Explore accountable and transparent blockchain projects curated by ECF Pensieve.';
  const description =
    highlights.length > 0
      ? `${baseDescription} ${highlights.join(' ')}`
      : baseDescription;

  const keywords = [
    'ECF Pensieve projects',
    'blockchain transparency',
    'accountable web3 projects',
  ];

  if (topAccountable?.name) {
    keywords.push(topAccountable.name);
  }

  if (topTransparent?.name) {
    keywords.push(topTransparent.name);
  }

  const pageUrl = buildAbsoluteUrl(PROJECTS_ROUTE);

  return {
    title: 'Projects | ECF Pensieve',
    description,
    keywords,
    openGraph: {
      title: 'Explore Projects | ECF Pensieve',
      description,
      url: pageUrl,
      images: ['/images/home-og.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Explore Projects | ECF Pensieve',
      description,
    },
  };
}

function buildFeaturedProjectsJsonLd(
  projects: ProjectStructuredData[],
): Array<Record<string, unknown>> {
  if (projects.length === 0) {
    return [];
  }

  const featuredItems = projects
    .map((project, index) => {
      const projectJson = buildProjectJsonLd(String(project.id), project);

      if (!projectJson) {
        return null;
      }

      const { ['@context']: _context, ...rest } = projectJson as Record<
        string,
        unknown
      >;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: rest,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        '@type': 'ListItem';
        position: number;
        item: Record<string, unknown>;
      } => Boolean(entry),
    );

  if (featuredItems.length === 0) {
    return [];
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Featured Projects on ECF Pensieve',
      description:
        'Top accountable and transparent blockchain projects highlighted on the projects directory.',
      url: buildAbsoluteUrl(PROJECTS_ROUTE),
      numberOfItems: featuredItems.length,
      itemListOrder: 'ItemListOrderAscending',
      itemListElement: featuredItems,
    },
  ];
}

export default async function ProjectsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [accountableProjects, transparentProjects] = await Promise.all([
    getTopAccountableProjects(3),
    getTopTransparentProjects(3),
  ]);

  const featuredProjects: ProjectStructuredData[] = [];

  const appendUnique = (project?: ProjectStructuredData) => {
    if (!project || typeof project.id !== 'number') {
      return;
    }
    if (featuredProjects.find((item) => item.id === project.id)) {
      return;
    }
    featuredProjects.push(project);
  };

  appendUnique(accountableProjects[0]);
  appendUnique(transparentProjects[0]);

  const pageUrl = buildAbsoluteUrl(PROJECTS_ROUTE);

  const jsonLdNodes: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#projects`,
      url: pageUrl,
      name: 'ECF Pensieve Projects Directory',
      description:
        'Discover transparent and accountable blockchain projects curated by the ECF Pensieve community.',
    },
    ...buildFeaturedProjectsJsonLd(featuredProjects),
  ];

  const jsonLdString = JSON.stringify(jsonLdNodes);

  return (
    <>
      <script
        id="projects-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <ProjectsLayoutClient>{children}</ProjectsLayoutClient>
    </>
  );
}
