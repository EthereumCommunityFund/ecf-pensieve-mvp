import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  const logoUrl = searchParams.get('logoUrl');

  return new ImageResponse(
    (
      <div
        style={{
          background:
            'linear-gradient(116.93deg, #28C196 -17.27%, #FFFFFF 71.68%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        {/* ECF Pensieve Logo/Brand */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          ECF PENSIEVE
        </div>

        {/* Project Logo */}
        {logoUrl && (
          <img
            src={logoUrl}
            width="120"
            height="120"
            style={{
              borderRadius: '60px',
              border: '4px solid white',
              marginBottom: '30px',
            }}
          />
        )}

        {/* Published Badge */}
        <div
          style={{
            background: '#10B981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
          }}
        >
          ✅ PUBLISHED
        </div>

        {/* Project Name */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          {projectName}
        </div>

        {/* Subtitle */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: '#6b7280',
          }}
        >
          Community-Validated Web3 Projects
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 675,
    },
  );
}
