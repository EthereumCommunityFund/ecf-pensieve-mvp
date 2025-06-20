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

📌 ${project.name}
${project.tagline}

🔗 View details: ${platformUrl}

#ECFPensieve`;
}

async function generateProjectImage(project: ProjectData): Promise<Buffer> {
  const imageUrl = `${getHost()}/api/generateXImage?projectName=${encodeURIComponent(project.name)}&logoUrl=${encodeURIComponent(project.logoUrl)}`;

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Image generation failed: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
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
    console.error(`Failed to send tweet for project ${project.id}:`, error);
    return false;
  }
}
