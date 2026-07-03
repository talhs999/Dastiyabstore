import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'site_reviews' }
    });
    
    if (setting && setting.value) {
      const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      return NextResponse.json(parsed);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
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
