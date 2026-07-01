import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, context: any) {
  try {
    const slug = context.params.slug;
    const body = await request.json();

    const newReview = await prisma.productReview.create({
      data: {
        product_id: body.product_id,
        customer_name: body.customer_name,
        rating: body.rating,
        review_text: body.review_text,
        is_approved: false
      }
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
