import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        owner: true,
        _count: {
          select: { products: true, orders: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cleanEmail = body.email.trim().toLowerCase();
    
    // 1. Create or find Customer with role vendor
    let customer = await prisma.customer.findUnique({ where: { email: cleanEmail } });
    
    if (customer) {
      if (customer.role !== 'vendor') {
        customer = await prisma.customer.update({
          where: { email: cleanEmail },
          data: { role: 'vendor' }
        });
      }
    } else {
      const hashedPassword = body.password ? body.password : "vendor123"; // Simplification for demo
      customer = await prisma.customer.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          name: body.owner_name,
          role: 'vendor'
        }
      });
    }

    // Generate unique slug
    let baseSlug = body.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Create Store
    const store = await prisma.store.create({
      data: {
        name: body.store_name,
        slug,
        owner_id: customer.id
      }
    });

    return NextResponse.json({ store, customer });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Since we don't have cascade delete configured on the Prisma schema,
    // we manually handle deleting/unlinking associated records.

    const storeProducts = await prisma.product.findMany({ where: { store_id: id }, select: { id: true } });
    const productIds = storeProducts.map((p: any) => p.id);

    if (productIds.length > 0) {
      await prisma.productReview.deleteMany({ where: { product_id: { in: productIds } } });
      await prisma.productQna.deleteMany({ where: { product_id: { in: productIds } } });
      await prisma.productAnalyticsEvent.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.product.deleteMany({ where: { store_id: id } });
    }

    await prisma.category.deleteMany({ where: { store_id: id } });
    await prisma.shippingRule.deleteMany({ where: { store_id: id } });
    await prisma.coupon.deleteMany({ where: { store_id: id } });
    
    // For orders, it's safer to keep the order history but remove the store association
    await prisma.order.updateMany({ where: { store_id: id }, data: { store_id: null } });

    // Now safe to delete the store
    await prisma.store.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete vendor error:", error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
