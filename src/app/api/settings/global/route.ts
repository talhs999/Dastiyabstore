import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'global_free_delivery' }
    });

    if (setting) {
      return NextResponse.json(setting.value);
    }
    
    // Default values if not set in DB
    return NextResponse.json({ is_active: true, threshold: 2000 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch global settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (typeof body.is_active !== 'boolean' || typeof body.threshold !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const setting = await prisma.storeSetting.upsert({
      where: { key: 'global_free_delivery' },
      update: { value: body },
      create: {
        key: 'global_free_delivery',
        value: body
      }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save global settings' }, { status: 500 });
  }
}
