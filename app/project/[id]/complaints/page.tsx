import ProjectComplaintsPage from '@/components/pages/discourse/ProjectComplaintsPage';

type ComplaintsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComplaintsPage({ params }: ComplaintsPageProps) {
  const { id } = await params;

  return <ProjectComplaintsPage projectId={id} />;
}
