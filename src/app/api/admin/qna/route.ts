import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const qnas = await prisma.productQna.findMany({
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(qnas);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, answer } = await request.json();
    
    if (!id || !answer) {
      return NextResponse.json({ error: 'ID and answer are required' }, { status: 400 });
    }

    const updatedQnA = await prisma.productQna.update({
      where: { id },
      data: { 
        answer,
        is_answered: true,
        answered_at: new Date()
      }
    });

    return NextResponse.json(updatedQnA);
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

    await prisma.productQna.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
