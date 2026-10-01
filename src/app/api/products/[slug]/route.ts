import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SITE_REVIEWS } from '@/data/siteReviews';

export const dynamic = 'force-dynamic';

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
      } : { slug: slug },
      include: {
        category: true,
        store: { select: { id: true, name: true, slug: true } }
      }
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

    let siteReviews: any[] = [];
    // Only show general store reviews for Dastiyab Store's own products (not vendor products)
    if (!product.store_id) {
      try {
        const siteReviewsSetting = await prisma.storeSetting.findUnique({
          where: { key: 'site_reviews' }
        });
        if (siteReviewsSetting && siteReviewsSetting.value) {
          siteReviews = typeof siteReviewsSetting.value === 'string'
            ? JSON.parse(siteReviewsSetting.value)
            : siteReviewsSetting.value;
        }
      } catch (e) {
        console.error('Error fetching site reviews:', e);
      }
      if (!Array.isArray(siteReviews) || siteReviews.length === 0) {
        siteReviews = DEFAULT_SITE_REVIEWS;
      }
    }

    // Fetch related products (same category first, fallback to popular/recent)
    let relatedProducts: any[] = [];
    if (product.category_id) {
      relatedProducts = await prisma.product.findMany({
        where: {
          category_id: product.category_id,
          id: { not: product.id }
        },
        take: 8,
        orderBy: { created_at: 'desc' },
        include: {
          category: true,
          store: { select: { id: true, name: true, slug: true } }
        }
      });
    }

    if (relatedProducts.length < 4) {
      const excludeIds = [product.id, ...relatedProducts.map(p => p.id)];
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: excludeIds }
        },
        take: 8 - relatedProducts.length,
        orderBy: { created_at: 'desc' },
        include: {
          category: true,
          store: { select: { id: true, name: true, slug: true } }
        }
      });
      relatedProducts = [...relatedProducts, ...fallbackProducts];
    }

    return NextResponse.json({ product, reviews, qna, siteReviews, relatedProducts });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
