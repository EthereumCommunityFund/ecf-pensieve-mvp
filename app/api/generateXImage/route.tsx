export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('projectName') || 'Test Project';
  const logoUrl = searchParams.get('logoUrl');

  const escapeXml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const svg = `
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#28C196;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      
      <!-- ECF Pensieve Brand -->
      <text x="40" y="60" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#fff">ECF PENSIEVE</text>
      
      <!-- Project Logo (if provided)  -->
      ${
        logoUrl
          ? `
        <defs>
          <clipPath id="circle-clip">
            <circle cx="600" cy="270" r="150"/>
          </clipPath>
        </defs>
        <image href="${escapeXml(logoUrl)}" x="450" y="120" width="300" height="300" clip-path="url(#circle-clip)" preserveAspectRatio="xMidYMid slice"/>
      `
          : ''
      }
      
      <!-- Project Name  -->
      <text x="600" y="480" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1f2937">${escapeXml(projectName)}</text>
      
      <!-- Published Badge  -->
      <rect x="500" y="510" width="200" height="40" rx="20" fill="#10B981"/>
      <text x="600" y="534" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">✅ PUBLISHED</text>
      
      <!-- Subtitle  -->
      <text x="600" y="610" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#6b7280">Decentralized social consensus &amp; community knowledge bases</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
