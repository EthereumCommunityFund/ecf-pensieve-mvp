import fs from 'fs';
import path from 'path';

import { ImageResponse } from '@vercel/og';
import type { Font } from 'satori';

export const runtime = 'nodejs';

async function getFonts(): Promise<Font[]> {
  const fontDir = path.join(process.cwd(), 'public/fonts');

  return [
    {
      name: 'MonaSans',
      data: fs.readFileSync(path.join(fontDir, 'MonaSans-Regular.ttf')),
      style: 'normal',
      weight: 400,
    },
    {
      name: 'MonaSans',
      data: fs.readFileSync(path.join(fontDir, 'MonaSans-SemiBold.ttf')),
      style: 'normal',
      weight: 600,
    },
    {
      name: 'MonaSans',
      data: fs.readFileSync(path.join(fontDir, 'MonaSans-Bold.ttf')),
      style: 'normal',
      weight: 700,
    },
  ];
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawProjectName = searchParams.get('projectName');
  const logoUrl = searchParams.get('logoUrl');
  const rawTagline = searchParams.get('tagline');
  const projectName = rawProjectName ? truncateText(rawProjectName, 36) : '';
  const tagline = rawTagline ? truncateText(rawTagline, 440) : '';

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: 80,
            background:
              'linear-gradient(168deg, rgba(40, 193, 150, 1) 0%, rgba(255, 255, 255, 1) 100%)',
            overflow: 'hidden',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 30,
            display: 'flex',
            fontFamily: 'MonaSans',
          }}
        >
          <div
            style={{
              paddingLeft: 30,
              paddingRight: 30,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  height: 70,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <img
                  src={`${origin}/pensieve-logo.svg`}
                  width={70}
                  height={70}
                  alt="Pensieve Logo"
                />
                <div
                  style={{
                    color: 'black',
                    fontSize: 40,
                    fontWeight: 'bold',
                    fontFamily: 'MonaSans',
                    lineHeight: 1,
                    wordWrap: 'break-word',
                  }}
                >
                  Pensieve
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  opacity: 0.5,
                  height: 40,
                  color: 'black',
                  fontSize: 25,
                  fontWeight: 'normal',
                  fontFamily: 'MonaSans',
                  lineHeight: 1,
                  wordWrap: 'break-word',
                }}
              >
                Decentralized Social Consensus & Community Knowledge Bases
              </div>
            </div>
            <div
              style={{
                borderRadius: 10,
                border: '3px solid rgba(70, 162, 135, 1)',
                padding: '5px 10px 5px 10px',
                height: 70,
                gap: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={`${origin}/CheckCircle.svg`}
                width={50}
                height={50}
                alt="Check Circle"
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2d8f66',
                  fontSize: 26,
                  fontWeight: 'bold',
                  fontFamily: 'MonaSans',
                  textTransform: 'capitalize',
                  lineHeight: 1,
                  wordWrap: 'break-word',
                }}
              >
                Project published
              </div>
            </div>
          </div>
          <div
            style={{
              width: '100%',
              height: 270,
              paddingLeft: 30,
              paddingRight: 30,
              paddingTop: 15,
              paddingBottom: 15,
              gap: 20,
              borderRadius: 10,
              background: 'rgba(245, 245, 245, 0.5)',
              border: '2px solid white',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <img
              src={logoUrl!}
              width={200}
              height={200}
              style={{
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 10,
                background: 'white',
                objectFit: 'cover',
              }}
              alt="Project Logo"
            />
            <div
              style={{
                display: 'flex',
                position: 'relative',
                width: '100%',
                height: 200,
                paddingLeft: 20,
              }}
            >
              <div
                style={{
                  opacity: 0.8,
                  position: 'absolute',
                  left: 0,
                  color: 'black',
                  fontSize: 32,
                  fontWeight: 'bold',
                  lineHeight: 1,
                  wordWrap: 'break-word',
                }}
              >
                {projectName}
              </div>
              <div
                style={{
                  opacity: 0.68,
                  width: 700,
                  position: 'absolute',
                  top: 50,
                  left: 3,
                  color: 'black',
                  fontSize: 20,
                  fontWeight: 'normal',
                  fontFamily: 'MonaSans',
                  lineHeight: 1.2,
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  display: 'block',
                }}
              >
                {tagline}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: await getFonts(),
      },
    );
  } catch (error) {
    console.error('Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
