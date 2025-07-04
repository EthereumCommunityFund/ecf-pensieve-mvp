import { getHost } from '@/lib/utils';

interface ProjectData {
  id: number;
  name: string;
  tagline: string;
  logoUrl: string;
}

async function getTwitterClient() {
  const { TwitterApi } = await import('twitter-api-v2');

  if (
    !process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_TOKEN_SECRET
  ) {
    throw new Error('Twitter OAuth 1.0a credentials not configured');
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
}

function generateTweetContent(project: ProjectData): string {
  const platformUrl = `${getHost()}/project/${project.id}`;

  return `🚀 New project published on ECF Pensieve!

Name: ${project.name}
Tagline: ${project.tagline}

🔗 View details: ${platformUrl}

#ECFPensieve`;
}

async function generateProjectImage(project: ProjectData): Promise<Buffer> {
  const params = new URLSearchParams({
    projectName: project.name,
    logoUrl: project.logoUrl,
    tagline: project.tagline,
  });

  const imageUrl = `${getHost()}/api/generateXImage?${params.toString()}`;

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Image generation failed: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log('Generated image size:', arrayBuffer.byteLength);
  return Buffer.from(arrayBuffer);
}

export async function sendProjectPublishTweet(
  project: ProjectData,
): Promise<boolean> {
  try {
    const client = await getTwitterClient();
    const tweetContent = generateTweetContent(project);

    const imageBuffer = await generateProjectImage(project);

    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/png',
      target: 'tweet',
    });

    const tweet = await client.v2.tweet({
      text: tweetContent,
      media: { media_ids: [mediaId] },
    });

    return true;
  } catch (error) {
    if (error && typeof error === 'object') {
      console.error('Error object:', JSON.stringify(error, null, 2));
    }

    return false;
  }
}

export async function testProjectPublishTweet(): Promise<void> {
  const testProject: ProjectData = {
    id: 999,
    name: 'Test Project',
    tagline: 'This is a test project for Twitter integration',
    logoUrl: 'https://github.com/github.png',
  };

  try {
    console.log('🧪 Testing Twitter publish...');
    console.log('Test project data:', testProject);

    const result = await sendProjectPublishTweet(testProject);

    if (result) {
      console.log('✅ Twitter publish test successful!');
    } else {
      console.log('❌ Twitter publish test failed!');
    }
  } catch (error) {
    console.error('💥 Twitter publish test error:', error);
  }
}

export async function testImageGeneration(): Promise<void> {
  const testProject: ProjectData = {
    id: 999,
    name: 'Test Project',
    tagline: 'This is a test project for image generation',
    logoUrl: 'https://github.com/github.png',
  };

  try {
    console.log('🖼️ Testing image generation...');
    const imageBuffer = await generateProjectImage(testProject);
    console.log('✅ Image generation successful! Size:', imageBuffer.length);
  } catch (error) {
    console.error('💥 Image generation test error:', error);
  }
}

export async function testTwitterUpload(): Promise<void> {
  try {
    console.log('🐦 Testing Twitter upload...');
    const client = await getTwitterClient();

    const testProject: ProjectData = {
      id: 999,
      name: 'Test Upload',
      tagline: 'Test tagline',
      logoUrl: 'https://github.com/github.png',
    };

    const imageBuffer = await generateProjectImage(testProject);
    console.log('📤 Testing upload with image size:', imageBuffer.length);

    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/png',
      target: 'tweet',
    });

    console.log('✅ Twitter upload test successful! Media ID:', mediaId);
  } catch (error) {
    console.error('💥 Twitter upload test error:');
    console.error('Error details:', error);
    if (error && typeof error === 'object') {
      console.error('Error object:', JSON.stringify(error, null, 2));
    }
  }
}

export async function runAllTests(): Promise<void> {
  console.log('🚀 Starting comprehensive Twitter integration tests...\n');

  console.log('=== 1. Testing Image Generation ===');
  await testImageGeneration();
  console.log('');

  console.log('=== 2. Testing Twitter Upload ===');
  await testTwitterUpload();
  console.log('');

  console.log('=== 3. Testing Full Twitter Publish ===');
  await testProjectPublishTweet();
  console.log('');

  console.log('🏁 All tests completed!');
}
