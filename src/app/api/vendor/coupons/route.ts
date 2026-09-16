import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const store_id = searchParams.get('store_id');
    if (!store_id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const coupons = await prisma.coupon.findMany({
      where: { store_id },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, code, discount_type, discount_value, max_uses, is_active } = body;
    if (!store_id || !code || !discount_value) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        store_id,
        code: code.toUpperCase(),
        discount_type,
        discount_value: Number(discount_value),
        max_uses: Number(max_uses || 0),
        is_active: is_active ?? true
      }
    });
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, store_id, code, discount_type, discount_value, max_uses, is_active } = body;
    if (!id || !store_id) return NextResponse.json({ error: 'ID and Store ID required' }, { status: 400 });

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing || existing.store_id !== store_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        discount_type,
        discount_value: discount_value ? Number(discount_value) : undefined,
        max_uses: max_uses !== undefined ? Number(max_uses) : undefined,
        is_active: is_active ?? undefined
      }
    });
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const store_id = searchParams.get('store_id');
    if (!id || !store_id) return NextResponse.json({ error: 'ID and Store ID required' }, { status: 400 });

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing || existing.store_id !== store_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
