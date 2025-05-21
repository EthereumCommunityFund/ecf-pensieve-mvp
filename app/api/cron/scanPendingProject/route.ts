import { NextResponse } from 'next/server';

import { projectRouter } from '@/lib/trpc/routers/project';
import { createTRPCContext } from '@/lib/trpc/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
    const context = await createTRPCContext({ headers: new Headers() });
    const caller = projectRouter.createCaller(context);
    await caller.scanPendingProject();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error scanning pending projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scan pending projects' },
      { status: 500 },
    );
  }
}
