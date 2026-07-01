import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const coupon = await prisma.coupon.findFirst({
      where: { 
        code: code,
        is_active: true
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to verify coupon' }, { status: 500 });
  }
}
