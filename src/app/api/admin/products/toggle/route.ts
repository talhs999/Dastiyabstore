import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, field, value } = body;

    if (!productId || !field) {
      return NextResponse.json({ error: 'Product ID and field are required' }, { status: 400 });
    }

    if (field !== 'is_featured' && field !== 'is_best_seller') {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        [field]: value
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
