import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    
    if (!since) return NextResponse.json([]);

    const orders = await prisma.order.findMany({
      where: {
        created_at: { gt: new Date(since) }
      },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
