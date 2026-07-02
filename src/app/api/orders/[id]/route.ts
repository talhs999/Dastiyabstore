import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;
    const cleanId = id.trim().toLowerCase();

    const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    let order;

    if (isFullUuid) {
      order = await prisma.order.findUnique({
        where: { id: cleanId }
      });
    } else if (cleanId.length === 8 && /^[0-9a-f]{8}$/i.test(cleanId)) {
      // Find order starting with these 8 characters
      order = await prisma.order.findFirst({
        where: {
          id: { startsWith: cleanId }
        }
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Map Prisma items array to order_items property for backward compatibility with frontend
    const orderWithMappedItems = {
      ...order,
      customer_name: order.first_name ? `${order.first_name} ${order.last_name || ''}`.trim() : 'Customer',
      customer_email: order.email,
      customer_phone: order.phone,
      shipping_address: order.address || order.shipping_address, // fallback for old orders
      shipping_city: order.city,
      order_items: (order.items as any[] || []).map((item: any) => ({
        ...item,
        // Ensure property names match what frontend expects
      }))
    };

    return NextResponse.json(orderWithMappedItems);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
