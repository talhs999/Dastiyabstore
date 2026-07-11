import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600;

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params.slug;
    
    // Check if UUID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
    
    const product = await prisma.product.findFirst({
      where: isUUID ? {
        OR: [
          { id: slug },
          { slug: slug }
        ]
      } : { slug: slug }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await prisma.productReview.findMany({
      where: { product_id: product.id },
      orderBy: { created_at: 'desc' }
    });

    const qna = await prisma.productQna.findMany({
      where: { product_id: product.id },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ product, reviews, qna });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
