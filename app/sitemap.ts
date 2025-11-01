import { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import { getSitemapData } from '@/lib/services/sitemapService';

const siteUrl = 'https://pensieve.ecf.network';

const getCachedSitemap = unstable_cache(
  async () => {
    const data = await getSitemapData();

    const baseUrls: MetadataRoute.Sitemap = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${siteUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${siteUrl}/projects/pending`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.5,
      },
    ];

    const projectUrls: MetadataRoute.Sitemap = data.projects.flatMap(
      (project) => {
        if (project.isPublished) {
          const lastModified =
            project.latestItemProposalTime &&
            project.latestItemProposalTime > project.updatedAt
              ? project.latestItemProposalTime
              : project.updatedAt;

          return [
            {
              url: `${siteUrl}/project/${project.id}?tab=profile`,
              lastModified,
              changeFrequency: 'daily',
              priority: 0.9,
            },
          ];
        } else {
          return [];
        }
      },
    );

    const profileUrls: MetadataRoute.Sitemap = data.profiles
      .map((profile) => [
        {
          url: `${siteUrl}/profile/${profile.address}?tab=contributions`,
          lastModified: profile.updatedAt,
          changeFrequency: 'daily' as const,
          priority: 0.5,
        },
      ])
      .flat();

    const proposalUrls: MetadataRoute.Sitemap = data.proposals.map(
      (proposal) => ({
        url: `${siteUrl}/project/pending/${proposal.projectId}/proposal/${proposal.id}`,
        lastModified: proposal.createdAt,
        changeFrequency: 'daily',
        priority: 0.7,
      }),
    );

    return [...baseUrls, ...projectUrls, ...profileUrls, ...proposalUrls];
  },
  ['sitemap'],
  { revalidate: 21600 },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await getCachedSitemap();
}
