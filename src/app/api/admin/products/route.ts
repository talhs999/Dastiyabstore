import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isBundle = searchParams.get('is_bundle');
    const includeVendor = searchParams.get('include_vendor');

    const whereClause: any = {
      is_bundle: isBundle === 'true'
    };

    if (includeVendor !== 'true') {
      whereClause.store_id = null;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Normalize and clean id
    id = decodeURIComponent(id).trim().replace(/\s/g, '-');

    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Safely delete associated relations first
    await prisma.productReview.deleteMany({ where: { product_id: id } }).catch(() => {});
    await prisma.productQna.deleteMany({ where: { product_id: id } }).catch(() => {});
    await prisma.productAnalyticsEvent.deleteMany({ where: { productId: id } }).catch(() => {});

    await prisma.product.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete product' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Handle category_id mapping for Prisma
    if ('category_id' in data) {
      if (data.category_id) {
        data.category = { connect: { id: data.category_id } };
      }
      delete data.category_id;
    }

    // Handle store_id mapping for Prisma
    if ('store_id' in data) {
      if (data.store_id) {
        data.store = { connect: { id: data.store_id } };
      }
      delete data.store_id;
    }

    const newProduct = await prisma.product.create({
      data: data
    });
    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
