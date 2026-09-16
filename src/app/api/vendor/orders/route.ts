import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const store_id = searchParams.get('store_id');
    if (!store_id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const orders = await prisma.order.findMany({
      where: { store_id },
      include: { store: true },
      orderBy: { created_at: 'desc' }
    });

    const formattedOrders = orders.map(o => ({
      ...o,
      customer_name: [o.first_name, o.last_name].filter(Boolean).join(' ') || 'Guest',
      customer_email: o.email,
      customer_phone: o.phone,
      total_amount: o.total || 0,
      subtotal: o.subtotal !== null ? o.subtotal : (o.total || 0),
      shipping_fee: o.shipping_fee || 0,
      shipping_address: o.address || '',
      shipping_city: o.city || '',
      order_items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendor orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, store_id, status, delivery_paid, items } = body;
    if (!id || !store_id || !status) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.store_id !== store_id) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 403 });
    }

    const dataToUpdate: any = { status };
    if (delivery_paid !== undefined) dataToUpdate.delivery_paid = parseFloat(delivery_paid) || 0;
    if (items !== undefined) dataToUpdate.items = JSON.stringify(items);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
