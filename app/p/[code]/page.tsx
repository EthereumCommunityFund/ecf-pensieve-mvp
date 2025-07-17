import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ShortLinkRedirect({ params }: PageProps) {
  const { code } = await params;

  if (!code || typeof code !== 'string') {
    notFound();
  }

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.shortCode, code),
      columns: {
        id: true,
        isPublished: true,
      },
    });

    if (!project) {
      notFound();
    }

    if (project.isPublished) {
      redirect(`/project/${project.id}`);
    } else {
      redirect(`/project/pending/${project.id}`);
    }
  } catch (error) {
    console.error('Error in short link redirect:', error);
    notFound();
  }
}
