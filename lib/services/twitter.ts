import { getHost } from '@/lib/utils';

interface ProjectData {
  id: number;
  name: string;
  tagline: string;
  logoUrl: string;
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
  const imageUrl = `${getHost()}/api/generateXImage?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}&logoUrl=${encodeURIComponent(project.logoUrl)}`;

  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImageToTwitter(
  imageBuffer: Buffer,
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('media', new Blob([imageBuffer], { type: 'image/png' }));
    formData.append('media_category', 'tweet_image');

    const response = await fetch(
      'https://upload.twitter.com/1.1/media/upload.json',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        body: formData,
      },
    );

    if (response.ok) {
      const result = await response.json();
      return result.media_id_string;
    } else {
      const error = await response.json();
      console.error('Failed to upload image to Twitter:', error);
      return null;
    }
  } catch (error) {
    console.error('Failed to upload image to Twitter:', error);
    return null;
  }
}

export async function sendProjectPublishTweet(
  project: ProjectData,
): Promise<boolean> {
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.log('Twitter service not enabled, skipping tweet');
    return false;
  }

  try {
    console.log(`📸 Generating image for project ${project.id}...`);
    const imageBuffer = await generateProjectImage(project);

    console.log(`⬆️ Uploading to Twitter...`);
    const mediaId = await uploadImageToTwitter(imageBuffer);

    const tweetContent = generateTweetContent(project);

    // Prepare tweet data
    const tweetData: any = {
      text: tweetContent,
    };

    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }

    // Send tweet
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Tweet sent for project ${project.id}:`, result.data?.id);
      return true;
    } else {
      const error = await response.json();
      console.error(
        `❌ Failed to send tweet for project ${project.id}:`,
        error,
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to send tweet for project ${project.id}:`, error);
    return false;
  }
}
