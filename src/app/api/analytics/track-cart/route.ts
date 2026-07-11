import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Record the analytics event
    await prisma.productAnalyticsEvent.create({
      data: {
        productId,
        eventType: 'ADD_TO_CART',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking add to cart:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
