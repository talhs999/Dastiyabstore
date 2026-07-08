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
    if (ids) {
      whereClause.id = { in: ids.split(',') };
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (search) {
      const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
      products = products.filter((p: any) => {
        const nameClean = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const descClean = p.description ? p.description.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const catClean = p.category?.name ? p.category.name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        
        return searchTerms.every(term => {
          const termClean = term.replace(/[^a-z0-9]/g, '');
          if (!termClean) return true;
          return nameClean.includes(termClean) || descClean.includes(termClean) || catClean.includes(termClean);
        });
      });
    }

    if (limit) {
      products = products.slice(0, limit);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
