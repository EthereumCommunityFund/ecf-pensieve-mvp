import { getHost } from '@/lib/utils';

interface ProjectData {
  id: number;
  name: string;
  tagline: string;
  logoUrl: string;
}

const MAX_TWEET_LENGTH = 280;

function truncateWithEllipsis(text: string, maxLength: number): string {
  if (maxLength <= 0) {
    return '';
  }

  const normalizedText = text.trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  if (maxLength === 1) {
    return '…';
  }

  const sliceLength = maxLength - 1;
  let truncated = normalizedText.slice(0, sliceLength);

  for (let i = truncated.length - 1; i >= 0; i -= 1) {
    if (/\s/.test(truncated[i])) {
      truncated = truncated.slice(0, i);
      break;
    }
  }

  return `${truncated.trimEnd()}…`;
}

function buildTweet(
  projectName: string,
  projectTagline: string | null,
  platformUrl: string,
): string {
  const lines = ['!! New page on Pensieve!', `Name: ${projectName}`];

  if (projectTagline !== null) {
    lines.push(`Tagline: ${projectTagline}`);
  }

  lines.push(
    '',
    `✅ View + validate:: ${platformUrl}`,
    '',
    '',
    "Built by contributors. Governed by citizens. Help keep Ethereum's memory honest",
    '',
    '#PensieveECF: the open source knowledge base for Web3.',
  );

  return lines.join('\n');
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
  const name = project.name.trim();
  const tagline = project.tagline.trim();

  let tweet = buildTweet(name, tagline, platformUrl);

  if (tweet.length <= MAX_TWEET_LENGTH) {
    return tweet;
  }

  const baseWithEmptyTagline = buildTweet(name, '', platformUrl);
  const availableForTagline = MAX_TWEET_LENGTH - baseWithEmptyTagline.length;

  if (availableForTagline > 0) {
    const truncatedTagline = truncateWithEllipsis(tagline, availableForTagline);
    tweet = truncatedTagline
      ? buildTweet(name, truncatedTagline, platformUrl)
      : buildTweet(name, null, platformUrl);

    if (tweet.length <= MAX_TWEET_LENGTH) {
      return tweet;
    }
  }

  tweet = buildTweet(name, null, platformUrl);

  if (tweet.length <= MAX_TWEET_LENGTH) {
    return tweet;
  }

  const baseWithEmptyName = buildTweet('', null, platformUrl);
  const availableForName = MAX_TWEET_LENGTH - baseWithEmptyName.length;
  const truncatedName = truncateWithEllipsis(name, availableForName);

  tweet = buildTweet(truncatedName, null, platformUrl);

  if (tweet.length <= MAX_TWEET_LENGTH) {
    return tweet;
  }

  return truncateWithEllipsis(tweet, MAX_TWEET_LENGTH);
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
