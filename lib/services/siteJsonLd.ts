import { buildProjectJsonLd } from '@/lib/services/projectJsonLd';
import type { ProjectStructuredData } from '@/lib/services/projectService';
import { buildAbsoluteUrl } from '@/lib/utils/url';

interface BuildSiteJsonLdOptions {
  topAccountableProjects?: ProjectStructuredData[];
}

export function buildSiteJsonLd({
  topAccountableProjects = [],
}: BuildSiteJsonLdOptions = {}): Array<Record<string, unknown>> {
  const siteUrl = buildAbsoluteUrl('/');
  const logoUrl = buildAbsoluteUrl('/images/Logo.png');

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ECF Pensieve',
    url: siteUrl,
    logo: logoUrl,
    description:
      'ECF Pensieve is a decentralized knowledge base curated by the Ethereum Community Fund.',
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ECF Pensieve',
    url: siteUrl,
    description:
      'Discover and validate blockchain projects with the ECF Pensieve community knowledge base.',
  };

  const jsonLd: Array<Record<string, unknown>> = [organization, website];

  if (topAccountableProjects.length > 0) {
    const itemListElement = topAccountableProjects
      .map((project, index) => {
        const projectJson = buildProjectJsonLd(String(project.id), project);

        if (!projectJson) {
          return null;
        }

        const { ['@context']: _context, ...projectWithoutContext } =
          projectJson as Record<string, unknown>;

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: projectWithoutContext,
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

    if (itemListElement.length > 0) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Top Accountable Projects on ECF Pensieve',
        description:
          'Top community-accountable blockchain projects ranked by ECF Pensieve.',
        url: buildAbsoluteUrl('/projects?sort=top-accountable'),
        numberOfItems: itemListElement.length,
        itemListOrder: 'ItemListOrderAscending',
        itemListElement,
      });
    }
  }

  return jsonLd;
}
