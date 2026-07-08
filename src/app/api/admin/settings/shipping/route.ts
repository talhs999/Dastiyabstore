import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rules = await prisma.shippingRule.findMany({
      orderBy: { created_at: 'asc' }
    });
    return NextResponse.json(rules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newRule = await prisma.shippingRule.create({
      data: {
        name: data.name,
        city: data.city,
        base_fee: data.base_fee,
        per_km_fee: data.per_km_fee,
        free_delivery_threshold: data.free_delivery_threshold,
        free_delivery_km: data.free_delivery_km,
        free_areas: data.free_areas,
        estimated_days: data.estimated_days,
        is_active: data.is_active
      }
    });
    return NextResponse.json(newRule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const updated = await prisma.shippingRule.update({
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

    await prisma.shippingRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
