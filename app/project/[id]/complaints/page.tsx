import ProjectDiscoursePage from '@/components/pages/discourse/list/ProjectDiscoursePage';

type ComplaintsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComplaintsPage({ params }: ComplaintsPageProps) {
  const { id } = await params;

  return <ProjectDiscoursePage projectId={id} />;
}
