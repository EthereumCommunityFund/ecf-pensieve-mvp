import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

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
    const fontData = await fetch(
      new URL('/fonts/MonaSans-Bold.ttf', origin),
    ).then((res) => res.arrayBuffer());
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    fontFamily: 'Mona Sans',
                    fontWeight: '800',
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
                  fontFamily: 'Mona Sans',
                  fontWeight: '500',
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  fontFamily: 'Inter',
                  fontWeight: '700',
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl!}
              width={200}
              height={200}
              style={{
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 10,
                background: 'white',
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
                  fontFamily: 'Mona Sans',
                  fontWeight: '600',
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
                  fontFamily: 'Mona Sans',
                  fontWeight: '400',
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
        height: 628,
        fonts: [
          {
            name: 'Mona Sans',
            data: fontData,
            weight: 800,
            style: 'normal',
          },
        ],
      },
    );
  } catch (error) {
    console.error('Failed to generate image:', error);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            fontSize: 32,
            color: '#374151',
          }}
        >
          Error generating image
        </div>
      ),
      {
        width: 1200,
        height: 675,
      },
    );
  }
}
