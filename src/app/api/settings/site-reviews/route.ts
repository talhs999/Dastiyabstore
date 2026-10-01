import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { DEFAULT_SITE_REVIEWS } from '@/data/siteReviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'site_reviews' }
    });
    
    if (setting && setting.value) {
      const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json(parsed);
      }
    }
    
    return NextResponse.json(DEFAULT_SITE_REVIEWS);
  } catch (error) {
    return NextResponse.json(DEFAULT_SITE_REVIEWS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const setting = await prisma.storeSetting.upsert({
      where: { key: 'site_reviews' },
      update: { value: body },
      create: { key: 'site_reviews', value: body }
    });
    
    return NextResponse.json({ success: true, setting });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save reviews' }, { status: 500 });
  }
}
