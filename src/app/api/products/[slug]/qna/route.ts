import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params.slug;
    const body = await request.json();

    const newQna = await prisma.productQna.create({
      data: {
        product_id: body.product_id,
        customer_name: body.customer_name,
        question: body.question,
      }
    });

    return NextResponse.json(newQna);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to submit QnA' }, { status: 500 });
  }
}
