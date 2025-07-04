import { NextResponse } from 'next/server';

import {
  runAllTests,
  testImageGeneration,
  testProjectPublishTweet,
  testTwitterUpload,
} from '@/lib/services/twitter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'all';

  try {
    console.log(`🧪 Running test type: ${testType}`);

    switch (testType) {
      case 'image':
        await testImageGeneration();
        break;
      case 'upload':
        await testTwitterUpload();
        break;
      case 'publish':
        await testProjectPublishTweet();
        break;
      case 'all':
      default:
        await runAllTests();
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Test '${testType}' completed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
