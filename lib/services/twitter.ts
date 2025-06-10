import { getHost } from '@/lib/utils';

interface ProjectData {
  id: number;
  name: string;
  tagline: string;
  logoUrl: string;
}

let twitterClient: any = null;
let isInitialized = false;

async function initializeTwitterClient() {
  if (isInitialized) return twitterClient;

  try {
    const { TwitterApi } = await import('twitter-api-v2');

    const config = {
      appKey: process.env.TWITTER_API_KEY || '',
      appSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    };

    if (
      config.appKey &&
      config.appSecret &&
      config.accessToken &&
      config.accessSecret
    ) {
      twitterClient = new TwitterApi(config);
      console.log('✅ Twitter client initialized');
    } else {
      console.warn('⚠️ Twitter API credentials missing, bot disabled');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Twitter client:', error);
  }

  isInitialized = true;
  return twitterClient;
}

function generateTweetContent(project: ProjectData): string {
  const platformUrl = `${getHost()}/project/${project.id}`;

  return `🚀 New project published on ECF Pensieve!

📌 ${project.name}
${project.tagline}

🔗 View details: ${platformUrl}

#ECFPensieve #Web3 #Innovation`;
}

async function generateProjectImage(project: ProjectData): Promise<Buffer> {
  const imageUrl = `${getHost()}/api/generateXImage?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}&logoUrl=${encodeURIComponent(project.logoUrl)}`;

  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImageToTwitter(
  imageBuffer: Buffer,
): Promise<string | null> {
  const client = await initializeTwitterClient();
  if (!client) return null;

  try {
    const mediaUpload = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/png',
    });
    return mediaUpload;
  } catch (error) {
    console.error('Failed to upload image to Twitter:', error);
    return null;
  }
}

export async function sendProjectPublishTweet(
  project: ProjectData,
): Promise<boolean> {
  const client = await initializeTwitterClient();
  if (!client) {
    console.log('Twitter service not enabled, skipping tweet');
    return false;
  }

  try {
    console.log(`📸 Generating image for project ${project.id}...`);
    const imageBuffer = await generateProjectImage(project);

    console.log(`⬆️ Uploading to Twitter...`);
    const mediaId = await uploadImageToTwitter(imageBuffer);

    const tweetContent = generateTweetContent(project);

    const tweetOptions: any = {};
    if (mediaId) {
      tweetOptions.media = { media_ids: [mediaId] };
    }

    const response = await client.v2.tweet(tweetContent, tweetOptions);

    if (response.data) {
      console.log(`✅ Tweet sent for project ${project.id}:`, response.data.id);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to send tweet for project ${project.id}:`, error);
    return false;
  }
}
