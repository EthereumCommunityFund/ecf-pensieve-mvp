import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('projectName') || 'Test Project';
  const logoUrl = searchParams.get('logoUrl');

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #28C196 0%, #ffffff 100%)',
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          {/* ECF Pensieve Brand */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            ECF PENSIEVE
          </div>

          {/* Project Logo */}
          {logoUrl && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 300,
                height: 300,
                borderRadius: '50%',
                overflow: 'hidden',
                marginBottom: 40,
                backgroundColor: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Project Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Project Name */}
          <div
            style={{
              color: '#1f2937',
              fontSize: 48,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 20,
              maxWidth: '80%',
              lineHeight: 1.2,
            }}
          >
            {projectName}
          </div>

          {/* Published Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#10B981',
              color: 'white',
              paddingLeft: 30,
              paddingRight: 30,
              paddingTop: 15,
              paddingBottom: 15,
              borderRadius: 25,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 30,
            }}
          >
            ✅ PUBLISHED
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: '#6b7280',
              fontSize: 18,
              textAlign: 'center',
              maxWidth: '70%',
              lineHeight: 1.4,
            }}
          >
            Decentralized social consensus & community knowledge bases
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 675,
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
