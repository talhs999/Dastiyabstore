import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.productReview.findMany({
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, reply_text } = await request.json();
    
    if (!id || !reply_text) {
      return NextResponse.json({ error: 'ID and reply_text are required' }, { status: 400 });
    }

    const updatedReview = await prisma.productReview.update({
      where: { id },
      data: { reply_text }
    });

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.productReview.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
