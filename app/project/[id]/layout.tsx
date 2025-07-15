import { Metadata } from 'next';

import ClientLayout from './layout.client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { getProjectForMeta } = await import('@/lib/services/projectService');
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

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
