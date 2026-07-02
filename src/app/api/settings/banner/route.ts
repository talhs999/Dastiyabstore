import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'home_banner_slides' }
    });

    if (setting) {
      return NextResponse.json(setting.value);
    }
    
    return NextResponse.json({ slides: null });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch banner slides' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || !Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const setting = await prisma.storeSetting.upsert({
      where: { key: 'home_banner_slides' },
      update: { value: body },
      create: {
        key: 'home_banner_slides',
        value: body
      }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save banner slides' }, { status: 500 });
  }
}
