import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: any) {
  try {
    let { id } = await context.params;
    
    // Normalize id if it contains spaces or URL encoded spaces
    if (typeof id === 'string') {
      id = decodeURIComponent(id).replace(/\s/g, '-');
    }

    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    let { id } = await context.params;
    
    // Normalize id if it contains spaces or URL encoded spaces
    if (typeof id === 'string') {
      id = decodeURIComponent(id).replace(/\s/g, '-');
    }

    const data = await request.json();
    
    // Handle category_id mapping for Prisma
    if ('category_id' in data) {
      if (data.category_id) {
        data.category = { connect: { id: data.category_id } };
      } else {
        data.category = { disconnect: true };
      }
      delete data.category_id;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: data
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
