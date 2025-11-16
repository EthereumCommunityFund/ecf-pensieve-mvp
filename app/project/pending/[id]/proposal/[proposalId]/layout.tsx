import { notFound, redirect } from 'next/navigation';

import { getProjectPublicationStatus } from '@/lib/services/projectService';

import ClientLayout from './layout.client';

export default async function ProposalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isFinite(projectId)) {
    notFound();
  }

  const project = await getProjectPublicationStatus(projectId);

  if (!project) {
    notFound();
  }

  if (project.isPublished) {
    redirect(`/project/${projectId}`);
  }

  return <ClientLayout>{children}</ClientLayout>;
}
