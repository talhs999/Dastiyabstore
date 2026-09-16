import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    const vendor = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        products: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor details' }, { status: 500 });
  }
}
