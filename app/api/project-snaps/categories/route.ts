import { NextRequest, NextResponse } from 'next/server';

import { AllItemConfig } from '@/constants/itemConfig';

export const runtime = 'nodejs';

function validateApiKey(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_KEY;

  return apiKey === validApiKey;
}

export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      );
    }

    const categoriesConfig = AllItemConfig.categories;
    const categories = categoriesConfig?.options || [];

    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');

    return NextResponse.json(
      {
        data: categories.map((cat) => ({
          value: cat.value,
          label: cat.label,
        })),
        _meta: {
          source: 'config',
          total: categories.length,
        },
      },
      { headers },
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
