import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const [productsCount, ordersCount, orders] = await Promise.all([
      prisma.product.count({ where: { store_id: storeId } }),
      prisma.order.count({ where: { store_id: storeId } }),
      prisma.order.findMany({ 
        where: { store_id: storeId },
        select: { total: true }
      })
    ]);

    const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    return NextResponse.json({
      productsCount,
      ordersCount,
      revenue
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor stats' }, { status: 500 });
  }
}
