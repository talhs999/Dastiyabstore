import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 });

    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          include: { category: true }
        }
      }
    });

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}
