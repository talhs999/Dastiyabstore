import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const is_newsletter_coupon = searchParams.get('is_newsletter_coupon');
    
    if (is_newsletter_coupon === 'true') {
      const coupon = await prisma.coupon.findFirst({
        where: { is_newsletter_coupon: true }
      });
      return NextResponse.json(coupon || null);
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (data.is_newsletter_coupon) {
      await prisma.coupon.updateMany({
        where: { id: { not: "00000000-0000-0000-0000-000000000000" } }, // fake uuid syntax to match UI update query
        data: { is_newsletter_coupon: false }
      });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        is_newsletter_coupon: data.is_newsletter_coupon,
        is_active: data.is_active,
        max_uses: data.max_uses || 0
      }
    });
    return NextResponse.json(newCoupon);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    if (updateData.is_newsletter_coupon) {
      await prisma.coupon.updateMany({
        where: { id: { not: id } },
        data: { is_newsletter_coupon: false }
      });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
