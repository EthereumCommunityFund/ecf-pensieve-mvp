import { notFound, redirect } from 'next/navigation';

import { getProjectPublicationStatus } from '@/lib/services/projectService';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
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

  return <div className="pt-[20px]">{children}</div>;
}
