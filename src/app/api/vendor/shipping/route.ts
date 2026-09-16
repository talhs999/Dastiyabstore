import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const store_id = searchParams.get('store_id');
    if (!store_id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const rules = await prisma.shippingRule.findMany({
      where: { store_id },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipping rules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, name, city, base_fee, per_km_fee, free_delivery_threshold, free_delivery_km, free_areas, estimated_days, is_active } = body;
    if (!store_id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const rule = await prisma.shippingRule.create({
      data: {
        store_id,
        name,
        city,
        base_fee: Number(base_fee),
        per_km_fee: Number(per_km_fee || 0),
        free_delivery_threshold: Number(free_delivery_threshold),
        free_delivery_km: free_delivery_km ? Number(free_delivery_km) : null,
        free_areas,
        estimated_days,
        is_active: is_active ?? true
      }
    });
    return NextResponse.json(rule);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shipping rule' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, store_id, name, city, base_fee, per_km_fee, free_delivery_threshold, free_delivery_km, free_areas, estimated_days, is_active } = body;
    if (!id || !store_id) return NextResponse.json({ error: 'ID and Store ID required' }, { status: 400 });

    const existing = await prisma.shippingRule.findUnique({ where: { id } });
    if (!existing || existing.store_id !== store_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rule = await prisma.shippingRule.update({
      where: { id },
      data: {
        name,
        city,
        base_fee: Number(base_fee),
        per_km_fee: Number(per_km_fee || 0),
        free_delivery_threshold: Number(free_delivery_threshold),
        free_delivery_km: free_delivery_km ? Number(free_delivery_km) : null,
        free_areas,
        estimated_days,
        is_active: is_active ?? true
      }
    });
    return NextResponse.json(rule);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update shipping rule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const store_id = searchParams.get('store_id');
    if (!id || !store_id) return NextResponse.json({ error: 'ID and Store ID required' }, { status: 400 });

    const existing = await prisma.shippingRule.findUnique({ where: { id } });
    if (!existing || existing.store_id !== store_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.shippingRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete shipping rule' }, { status: 500 });
  }
}
