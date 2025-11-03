import '../styles/globals.css';

import { Metadata } from 'next';

import { ChatwootWidget } from '@/components/layout/ChatwootWidget';
import { MainLayout } from '@/components/layout/mainLayout';
import { Providers } from '@/components/layout/providers';
import {
  getHomePageStats,
  getTopAccountableProjects,
} from '@/lib/services/projectService';
import { buildSiteJsonLd } from '@/lib/services/siteJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getHomePageStats();

  const description = stats
    ? `Discover ${stats.verifiedProjects}+ verified blockchain projects, ${stats.expertContributors}+ contributors, ${stats.governanceVotes}+ votes. Leading Web3 platform.`
    : 'The leading platform for discovering and validating blockchain projects. Join our expert community building the future of Web3.';

  const ogDescription = stats
    ? `${stats.verifiedProjects}+ verified projects, ${stats.expertContributors}+ expert contributors, ${stats.governanceVotes}+ governance votes`
    : 'Discover, validate, and contribute to blockchain projects';

  return {
    title:
      'ECF Pensieve - Decentralized Knowledge Base for Blockchain Projects',
    description,
    keywords:
      'blockchain, decentralized, knowledge base, crypto projects, web3, ECF, pensieve',
    openGraph: {
      title: 'ECF Pensieve - Decentralized Knowledge Base',
      description: ogDescription,
      images: ['/images/home-og.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ECF Pensieve - Web3 Knowledge Base',
      description: ogDescription,
    },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topAccountableProjects = await getTopAccountableProjects(3);
  const siteJsonLd = JSON.stringify(
    buildSiteJsonLd({ topAccountableProjects }),
  );

  return (
    <html lang="en" className="min-w-[390px]">
      <head>
        <script
          id="site-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: siteJsonLd }}
        />
      </head>
      <body className="font-sans">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
        <ChatwootWidget position="right" />
      </body>
    </html>
  );
}
