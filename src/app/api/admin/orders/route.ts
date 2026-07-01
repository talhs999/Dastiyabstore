import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { created_at: 'desc' }
    });

    const formattedOrders = orders.map(o => ({
      ...o,
      customer_name: [o.first_name, o.last_name].filter(Boolean).join(' ') || 'Guest',
      customer_email: o.email,
      customer_phone: o.phone,
      total_amount: o.total || 0,
      subtotal: o.total || 0,
      shipping_fee: 0,
      shipping_address: o.address || '',
      shipping_city: o.city || '',
      order_items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { ids, status } = await request.json();
    
    if (!ids || !status) {
      return NextResponse.json({ error: 'IDs and status are required' }, { status: 400 });
    }

    const idArray = Array.isArray(ids) ? ids : [ids];

    await prisma.order.updateMany({
      where: { id: { in: idArray } },
      data: { status }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) return NextResponse.json({ error: 'IDs are required' }, { status: 400 });

    const ids = idsParam.split(',');

    // Order items are stored as JSON on the Order model, so they are deleted automatically when the order is deleted.
    await prisma.order.deleteMany({
      where: { id: { in: ids } }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
