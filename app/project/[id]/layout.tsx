import { Metadata } from 'next';

import { buildProjectJsonLd } from '@/lib/services/projectJsonLd';
import {
  getProjectForMeta,
  getProjectStructuredData,
} from '@/lib/services/projectService';

import ClientLayout from './layout.client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectForMeta(Number(id));

  if (project) {
    return {
      title: `${project.name} - ${project.tagline} | ECF Pensieve`,
      description:
        project.mainDescription?.slice(0, 160) ||
        `Discover ${project.name}, a published project on ECF Pensieve.`,
      keywords: `${project.name}, blockchain, ${project.tags?.join(', ')}, Web3, Ethereum, ECF Pensieve, Community, Accountable, Decentralized, Knowledge Base`,
      openGraph: {
        title: `${project.name} | ECF Pensieve`,
        description: project.tagline || project.mainDescription?.slice(0, 160),
        images: [project.logoUrl || '/images/default-project.png'],
      },
    };
  } else {
    return {
      title: `Project Details | ECF Pensieve`,
      description:
        'Discover verified blockchain projects and their contributions on ECF Pensieve, the leading Web3 knowledge platform.',
      keywords:
        'Web3, Ethereum, ECF Pensieve, Community, Accountable, Decentralized, Knowledge Base',
      openGraph: {
        title: 'Blockchain Project | ECF Pensieve',
        description: 'Explore verified blockchain projects on ECF Pensieve',
        images: ['/images/default-project.png'],
      },
    };
  }
}
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const structured = await getProjectStructuredData(Number(id));

  const jsonLd = structured ? buildProjectJsonLd(id, structured) : null;
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  return (
    <>
      {jsonLdString ? (
        <script
          id={`project-jsonld-${id}`}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
      ) : null}
      <ClientLayout>{children}</ClientLayout>
    </>
  );
}
