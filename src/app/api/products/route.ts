import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const isFeatured = searchParams.get('is_featured');
    const search = searchParams.get('search');
    const ids = searchParams.get('ids');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    let whereClause: any = {};
    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }
    if (isFeatured === 'true') {
      whereClause.is_featured = true;
    }
    if (search) {
      whereClause.name = { contains: search };
    }
    if (ids) {
      whereClause.id = { in: ids.split(',') };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
