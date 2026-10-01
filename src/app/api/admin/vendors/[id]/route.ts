import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
          select: { id: true, name: true, email: true, phone: true, address: true, city: true, created_at: true }
        },
        products: {
          include: {
            category: {
              select: { name: true, slug: true }
            }
          },
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

// Admin can update vendor details, including Login Email & Password!
export async function PUT(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    const {
      store_name,
      owner_name,
      email,
      password,
      phone,
      address,
      city,
      is_active
    } = body;

    const store = await prisma.store.findUnique({
      where: { id },
      include: { owner: true }
    });

    if (!store) {
      return NextResponse.json({ error: 'Vendor store not found' }, { status: 404 });
    }

    // 1. Update store record
    if (store_name !== undefined || is_active !== undefined) {
      await prisma.store.update({
        where: { id },
        data: {
          ...(store_name ? { name: store_name.trim() } : {}),
          ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {})
        }
      });
    }

    // 2. Update owner credentials & profile
    const ownerData: any = {};
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      // Check if email taken by someone else
      const conflict = await prisma.customer.findFirst({
        where: {
          email: cleanEmail,
          id: { not: store.owner_id }
        }
      });
      if (conflict) {
        return NextResponse.json({ error: 'This email is already registered to another account' }, { status: 400 });
      }
      ownerData.email = cleanEmail;
    }

    if (password && password.trim()) {
      ownerData.password = password.trim();
    }

    if (owner_name !== undefined) ownerData.name = owner_name.trim();
    if (phone !== undefined) ownerData.phone = phone ? phone.trim() : null;
    if (address !== undefined) ownerData.address = address ? address.trim() : null;
    if (city !== undefined) ownerData.city = city ? city.trim() : null;

    if (Object.keys(ownerData).length > 0 && store.owner_id) {
      await prisma.customer.update({
        where: { id: store.owner_id },
        data: ownerData
      });
    }

    // Return refreshed vendor details
    const updatedVendor = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true, address: true, city: true, created_at: true }
        }
      }
    });

    return NextResponse.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error('API Error updating vendor by admin:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
