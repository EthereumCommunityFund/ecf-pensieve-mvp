import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

// Force this page to be server-side rendered
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  let project;
  try {
    project = await db.query.projects.findFirst({
      where: eq(projects.shortCode, code),
      columns: {
        id: true,
        isPublished: true,
      },
    });
  } catch (error) {
    console.error('Error in short link redirect:', error);
    notFound();
  }

  if (!project) {
    notFound();
  }

  // redirect throws an error, so it should be called outside try-catch
  const redirectUrl = project.isPublished
    ? `/project/${project.id}`
    : `/project/pending/${project.id}`;

  redirect(redirectUrl);
}
