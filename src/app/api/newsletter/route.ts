import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'newsletter_enabled' }
    });
    
    let enabled = true;
    if (setting) {
      enabled = setting.value === true || setting.value === 'true';
    }

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Ignore error if it exists (Prisma handle)
    try {
      await prisma.newsletterSubscriber.create({
        data: { email }
      });
    } catch (e: any) {
      if (e.code !== 'P2002') { // Unique constraint failed
        console.error('Insert Error:', e);
      }
    }

    const coupon = await prisma.coupon.findFirst({
      where: { 
        is_active: true
      }
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
