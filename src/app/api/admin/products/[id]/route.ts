import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: any) {
  try {
    let { id } = await context.params;
    
    // Normalize id if it contains spaces (browser sometimes passes UUID hyphens as spaces)
    if (typeof id === 'string') {
      id = id.replace(/\s/g, '-');
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
    
    // Normalize id if it contains spaces
    if (typeof id === 'string') {
      id = id.replace(/\s/g, '-');
    }

    const data = await request.json();
    
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
