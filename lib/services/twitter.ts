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

  return `🧠 New page on Pensieve!
Name: ${project.name}
Tagline: ${project.tagline}

📚 Help keep Ethereum's memory honest
🔍 View + validate:: ${platformUrl}

✅ Validate facts
🗳 Upvote trusted projects
🧾 Share and co-curate history

✍ Built by contributors. Governed by citizens.
#**PensieveECF**: the open source knowledge base for Web3.`;
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
