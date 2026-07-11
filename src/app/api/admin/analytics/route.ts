import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30'; // days

    let dateFilter = {};
    if (range !== 'all') {
      const days = parseInt(range);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);
      dateFilter = {
        createdAt: {
          gte: pastDate
        }
      };
    }

    // Fetch the events grouped by productId
    const events = await prisma.productAnalyticsEvent.groupBy({
      by: ['productId'],
      _count: {
        productId: true
      },
      where: {
        eventType: 'ADD_TO_CART',
        ...dateFilter
      },
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: 20
    });

    // Fetch the actual product details for these IDs
    const productIds = events.map(e => e.productId);
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        image: true,
        price: true
      }
    });

    // Merge count data
    const analyticsData = events.map(e => {
      const product = products.find(p => p.id === e.productId);
      return {
        product: product || { name: 'Deleted Product', image: '', price: 0 },
        adds: e._count.productId
      };
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
